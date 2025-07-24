from bson import ObjectId
from typing import List, Optional
from app.db import get_db
import uuid

async def create_booking(booking_data: dict) -> str:
    db = await get_db()
    # Generate a unique booking reference
    booking_data["bookingReference"] = f"BK{uuid.uuid4().hex[:8].upper()}"
    result = await db.bookings.insert_one(booking_data)
    return str(result.inserted_id)

async def get_booking(booking_id: str) -> Optional[dict]:
    db = await get_db()
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if booking:
        booking["id"] = str(booking["_id"])
    return booking

async def get_booking_by_reference(booking_reference: str) -> Optional[dict]:
    db = await get_db()
    booking = await db.bookings.find_one({"bookingReference": booking_reference})
    if booking:
        booking["id"] = str(booking["_id"])
    return booking

async def get_bookings_by_property_id(property_id: str) -> List[dict]:
    db = await get_db()
    bookings = await db.bookings.find({"propertyId": property_id}).to_list(length=100)
    for booking in bookings:
        booking["id"] = str(booking["_id"])
    return bookings

async def get_all_bookings() -> List[dict]:
    db = await get_db()
    bookings = await db.bookings.find().to_list(length=100)
    for booking in bookings:
        booking["id"] = str(booking["_id"])
    return bookings

async def update_booking(booking_id: str, booking_data: dict) -> bool:
    db = await get_db()
    result = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": booking_data}
    )
    return result.modified_count > 0

async def delete_booking(booking_id: str) -> bool:
    db = await get_db()
    result = await db.bookings.delete_one({"_id": ObjectId(booking_id)})
    return result.deleted_count > 0