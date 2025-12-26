import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Dict, Set

import models, schemas
from database import SessionLocal
from routers.auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/ws", tags=["WebSocket Chat"])

class ConnectionManager:
    def __init__(self):
        # Store connections by channel_id
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Store user info for each connection
        self.connection_users: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, channel_id: int, user: models.User):
        await websocket.accept()
        
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = set()
        
        self.active_connections[channel_id].add(websocket)
        self.connection_users[websocket] = {
            "user_id": user.id,
            "username": user.username,
            "channel_id": channel_id
        }

    def disconnect(self, websocket: WebSocket):
        user_info = self.connection_users.get(websocket)
        if user_info:
            channel_id = user_info["channel_id"]
            if channel_id in self.active_connections:
                self.active_connections[channel_id].discard(websocket)
                if not self.active_connections[channel_id]:
                    del self.active_connections[channel_id]
            del self.connection_users[websocket]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast_to_channel(self, channel_id: int, message: dict):
        if channel_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection)

manager = ConnectionManager()

def _get_user_from_token(token: str, db: Session) -> models.User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            return None
        user_id = int(user_id_str)
        return db.query(models.User).filter(models.User.id == user_id).first()
    except (JWTError, ValueError):
        return None

@router.websocket("/chat/{channel_id}")
async def chat_websocket(websocket: WebSocket, channel_id: int, token: str = Query(...)):
    db: Session = SessionLocal()
    try:
        # Authenticate user
        user = _get_user_from_token(token, db)
        if not user:
            await websocket.close(code=4401)
            return

        # Check if user is member of channel
        membership = db.query(models.ChannelMember).filter(
            models.ChannelMember.channel_id == channel_id,
            models.ChannelMember.user_id == user.id
        ).first()
        
        if not membership:
            await websocket.close(code=4403)
            return

        # Connect to channel
        await manager.connect(websocket, channel_id, user)
        
        # Send connection confirmation
        await manager.send_personal_message(
            json.dumps({
                "type": "connected",
                "channel_id": channel_id,
                "user_id": user.id,
                "username": user.username
            }),
            websocket
        )

        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Handle different message types
                if message_data.get("type") == "message":
                    # Save message to database
                    new_message = models.Message(
                        content=message_data.get("content", ""),
                        message_type="text",
                        sender_id=user.id,
                        channel_id=channel_id
                    )
                    
                    db.add(new_message)
                    db.commit()
                    db.refresh(new_message)
                    
                    # Broadcast to all users in channel
                    broadcast_message = {
                        "type": "message",
                        "id": new_message.id,
                        "content": new_message.content,
                        "sender_id": new_message.sender_id,
                        "sender_username": user.username,
                        "channel_id": channel_id,
                        "timestamp": new_message.timestamp.isoformat(),
                        "message_type": new_message.message_type
                    }
                    
                    await manager.broadcast_to_channel(channel_id, broadcast_message)
                
                elif message_data.get("type") == "typing":
                    # Broadcast typing indicator
                    typing_message = {
                        "type": "typing",
                        "user_id": user.id,
                        "username": user.username,
                        "channel_id": channel_id,
                        "is_typing": message_data.get("is_typing", False)
                    }
                    await manager.broadcast_to_channel(channel_id, typing_message)

        except WebSocketDisconnect:
            pass
        finally:
            manager.disconnect(websocket)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=4000)
    finally:
        db.close()
