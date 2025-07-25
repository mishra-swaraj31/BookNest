from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/")

@router.get("/")
async def root():
    return {"message": "Hello World"}