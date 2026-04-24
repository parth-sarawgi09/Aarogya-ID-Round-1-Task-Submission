from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from contextlib import asynccontextmanager
from database import connect_to_mongo, close_mongo_connection
from api.router import router as api_router
from api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="AarogyaAid AI Insurance Advisor",
    description="Backend API for AI-powered health insurance recommendation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
# In production, you can restrict this to your Vercel frontend URL via FRONTEND_URL env var
frontend_url = os.getenv("FRONTEND_URL", "*")
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000", # React default port
    frontend_url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if frontend_url == "*" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin")

@app.get("/")
async def root():
    return {"message": "Welcome to AarogyaAid API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
