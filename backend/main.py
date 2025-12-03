from fastapi import FastAPI
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from routers import auth  # <--- IMPORT THIS

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the Auth routes
app.include_router(auth.router)  # <--- ADD THIS LINE

@app.get("/")
def read_root():
    return {"message": "TeamOS Python Backend is Running! 🚀"}