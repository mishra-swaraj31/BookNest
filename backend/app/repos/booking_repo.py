from app.core.db import db
from typing import List
import uuid

collection = db.get_collection("bookings")

async def create_booking(data: dict) -> dict:
    data['bookingId'] = str(uuid.uuid4())[:8]
    await collection.insert_one(data)
    return data

async def get_booking(booking_id: str) -> dict:
    booking = await collection.find_one({"bookingId": booking_id})
    return booking

async def get_all_bookings() -> List[dict]:
    bookings = await collection.find().to_list(length=None)
    return bookings

async def update_booking(booking_id: str, data: dict) -> dict:
    await collection.update_one({"bookingId": booking_id}, {"$set": data})
    updated_booking = await get_booking(booking_id)
    return updated_booking

async def delete_booking(booking_id: str) -> dict:
    result = await collection.delete_one({"bookingId": booking_id})
    if result.deleted_count == 1:
        return {"message": "Booking deleted successfully"}
    else:
        return {"message": "Booking not found"}