# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from app.models import models  # ensure models imported for metadata
from app.routers import auth, products, users, orders, stats, cart, categories, websocket, ai_chat
from app.middlewares.request_logger import RequestLoggerMiddleware
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables - .env.local takes priority over .env
env_local = Path(__file__).parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv()

app = FastAPI(title="Mini Sales API")

# Get CORS origins from environment variable
cors_origins_str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# include middlewares
app.add_middleware(RequestLoggerMiddleware)

# include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(stats.router)
app.include_router(categories.router)
app.include_router(websocket.router)
app.include_router(ai_chat.router)
app.mount("/static", StaticFiles(directory="uploads"), name="static")
@app.get("/")
def root():
    return {"msg": "Mini Sales API running"}
