from bson import ObjectId
from typing import List, Optional
from app.core.db import get_db
from passlib.context import CryptContext # type: ignore

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user(user_data: dict) -> str:
    db = get_db()
    
    # Check if user with this email already exists
    existing_user = await db.users.find_one({"email": user_data["email"]})
    if existing_user:
        return None
    
    # Hash the password
    user_data["password"] = pwd_context.hash(user_data["password"])
    
    result = await db.users.insert_one(user_data)
    return str(result.inserted_id)

async def get_user(user_id: str) -> Optional[dict]:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        user["id"] = str(user["_id"])
        # Don't return the password hash
        user.pop("password", None)
    return user

async def get_user_by_email(email: str) -> Optional[dict]:
    db = get_db()
    user = await db.users.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
    return user

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if not pwd_context.verify(password, user["password"]):
        return None
    # Don't return the password hash
    user.pop("password", None)
    return user

async def update_user(user_id: str, user_data: dict) -> bool:
    db = get_db()
    
    # If updating password, hash it
    if "password" in user_data:
        user_data["password"] = pwd_context.hash(user_data["password"])
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_data}
    )
    return result.modified_count > 0

async def delete_user(user_id: str) -> bool:
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0