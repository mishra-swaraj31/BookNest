from pydantic import BaseModel
from datetime import date
from typing import Optional

class Booking(BaseModel):
    guestName: str
    roomNo: int
    dateFrom: date
    dateTo: date

class BookingCreate(Booking):
    pass

class BookingUpdate(BaseModel):
    pass

class BookingOut(Booking):
    bookingId: str