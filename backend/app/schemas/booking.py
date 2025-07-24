from pydantic import BaseModel
from datetime import date
from typing import Optional

class Booking(BaseModel):
    propertyId: str
    propertyName: str
    checkIn: str
    checkOut: str
    guests: int
    address: str
    city: str
    price: float
    image: str

class BookingCreate(Booking):
    pass

class BookingUpdate(BaseModel):
    propertyId: Optional[str] = None
    propertyName: Optional[str] = None
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    guests: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

class BookingOut(Booking):
    id: str
    bookingReference: str