from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.booking import Booking, BookingCreate, BookingUpdate, BookingOut
from app.repos.booking_repo import create_booking, get_booking, get_booking_by_reference, get_bookings_by_property_id, get_all_bookings, update_booking, delete_booking
from typing import List
from app.core.auto_auth import get_current_user_no_auth

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking_endpoint(booking: BookingCreate, current_user: dict = Depends(get_current_user_no_auth)):
    booking_dict = booking.dict()
    # Ensure the booking is associated with the current user
    booking_dict["userId"] = current_user.get("id", "1")
    booking_id = await create_booking(booking_dict)
    created_booking = await get_booking(booking_id)
    return created_booking

@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking_endpoint(booking_id: str):
    booking = await get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.get("/reference/{booking_reference}", response_model=BookingOut)
async def get_booking_by_reference_endpoint(booking_reference: str):
    booking = await get_booking_by_reference(booking_reference)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.get("/property/{property_id}", response_model=List[BookingOut])
async def get_bookings_by_property_endpoint(property_id: str):
    return await get_bookings_by_property_id(property_id)

@router.get("/", response_model=List[BookingOut])
async def get_all_bookings_endpoint(current_user: dict = Depends(get_current_user_no_auth)):
    # In a real app, we would filter by user ID, but for demo purposes we'll show all
    return await get_all_bookings()

@router.put("/{booking_id}", response_model=BookingOut)
async def update_booking_endpoint(booking_id: str, booking: BookingUpdate):
    booking_dict = booking.dict(exclude_unset=True)
    updated = await update_booking(booking_id, booking_dict)
    if not updated:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await get_booking(booking_id)

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking_endpoint(booking_id: str):
    deleted = await delete_booking(booking_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")