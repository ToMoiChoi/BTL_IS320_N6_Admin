# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from app.models import models  # ensure models imported for metadata
from app.routers import auth, products, users, orders, stats
from app.middlewares.request_logger import RequestLoggerMiddleware
import os

app = FastAPI(title="Mini Sales API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
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
app.include_router(orders.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"msg": "Mini Sales API running"}
