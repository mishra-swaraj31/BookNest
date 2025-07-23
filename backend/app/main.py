from fastapi import FastAPI
from app.routers import booking
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title = "BookNest")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)