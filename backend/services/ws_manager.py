import asyncio
from typing import Any, Dict, Set

import anyio
from fastapi import WebSocket


class NotificationWSManager:
    def __init__(self):
        self._connections: Dict[int, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(user_id, set()).add(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self._connections.get(user_id)
            if not conns:
                return
            conns.discard(websocket)
            if not conns:
                self._connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, payload: Dict[str, Any]) -> None:
        async with self._lock:
            conns = list(self._connections.get(user_id, set()))

        if not conns:
            return

        to_remove: list[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_json(payload)
            except Exception:
                to_remove.append(ws)

        if to_remove:
            async with self._lock:
                conns2 = self._connections.get(user_id, set())
                for ws in to_remove:
                    conns2.discard(ws)
                if not conns2:
                    self._connections.pop(user_id, None)

    def send_to_user_sync(self, user_id: int, payload: Dict[str, Any]) -> None:
        anyio.from_thread.run(self.send_to_user, user_id, payload)


notification_ws_manager = NotificationWSManager()
