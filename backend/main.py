from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import auth, tasks, chat, channels, notifications
from routers.ws_notifications import router as ws_notifications_router
from routers.email import router as email_router
from routers.docs import router as docs_router
from routers.voice import router as voice_router
from routers.video import router as video_router
from routers.whiteboard import router as whiteboard_router
from routers.search import router as search_router
from routers.inbox import router as inbox_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="UnifiedTeamOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(chat.router)
app.include_router(channels.router)
app.include_router(notifications.router)
app.include_router(ws_notifications_router)
app.include_router(email_router)
app.include_router(docs_router)
app.include_router(voice_router)
app.include_router(video_router)
app.include_router(whiteboard_router)
app.include_router(search_router)
app.include_router(inbox_router)


@app.get("/")
def read_root():
    return {"message": "TeamOS Python Backend is Running! 🚀"}