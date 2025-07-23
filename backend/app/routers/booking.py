from fastapi import APIRouter, HTTPException
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut
from app.repos import booking_repo

router = APIRouter()

@router.post("/", response_model=BookingOut)
async def create_booking(booking: BookingCreate):
    return await booking_repo.create_booking(booking.dict())

@router.get("/", response_model=list[BookingOut])
async def get_all_bookings():
    return await booking_repo.get_all_bookings()

@router.get("/{booking_id}")
async def update_booking(booking_id: str, booking: BookingUpdate):
    existing_booking = await booking_repo.get_booking(booking_id)
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    updated_booking = await booking_repo.update_booking(booking_id, booking.dict())
    return updated_booking

@router.delete("/{booking_id}")
async def delete_booking(booking_id: str):
    result = await booking_repo.delete_booking(booking_id)
    if "message" in result and result["message"] == "Booking not found":
        raise HTTPException(status_code=404, detail=result["message"])
    return result