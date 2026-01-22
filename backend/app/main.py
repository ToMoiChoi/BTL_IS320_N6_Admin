# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from app.models import models  # ensure models imported for metadata
from app.routers import auth, products, users, orders, stats, cart, categories, recommendations
from app.middlewares.request_logger import RequestLoggerMiddleware
import os

app = FastAPI(title="Mini Sales API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080"
]

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
app.include_router(recommendations.router)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Startup event: preload recommendations cache
@app.on_event("startup")
def startup_load_cache():
    """Load product cache on server startup for low-latency recommendations."""
    from .database import SessionLocal
    from .routers.recommendations import product_cache
    db = SessionLocal()
    try:
        product_cache.load_products(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"msg": "Mini Sales API running"}
