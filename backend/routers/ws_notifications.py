import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import models, schemas
from database import SessionLocal
from routers.auth import SECRET_KEY, ALGORITHM
from services.ws_manager import notification_ws_manager


router = APIRouter(prefix="/api/ws", tags=["ws"])


def _get_user_id_from_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            return None
        return int(user_id_str)
    except (JWTError, ValueError):
        return None


@router.websocket("/notifications")
async def notifications_ws(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return

    user_id = _get_user_id_from_token(token)
    if not user_id:
        await websocket.close(code=4401)
        return

    db: Session = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            await websocket.close(code=4401)
            return

        await notification_ws_manager.connect(user_id, websocket)

        try:
            await websocket.send_json({"type": "connected"})
        except Exception:
            await notification_ws_manager.disconnect(user_id, websocket)
            await websocket.close()
            return

        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            pass
        finally:
            await notification_ws_manager.disconnect(user_id, websocket)
    finally:
        db.close()
