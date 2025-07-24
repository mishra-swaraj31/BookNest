from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class Room(BaseModel):
    id: str
    name: str
    description: str
    price: float
    beds: int
    guests: int
    amenities: List[str]
    images: List[str]

class Review(BaseModel):
    id: str
    userName: str
    rating: float
    date: str
    comment: str
    userImage: Optional[str] = None

class PropertyBase(BaseModel):
    title: str
    location: str
    rating: float
    reviewsCount: int
    description: str
    amenities: Dict[str, bool]
    rooms: List[Room]
    reviews: List[Review]
    image: str
    mapEmbedUrl: Optional[str] = None
    price: float
    beds: int
    baths: int
    freeCancellation: bool

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[float] = None
    reviewsCount: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[Dict[str, bool]] = None
    rooms: Optional[List[Room]] = None
    reviews: Optional[List[Review]] = None
    image: Optional[str] = None
    mapEmbedUrl: Optional[str] = None
    price: Optional[float] = None
    beds: Optional[int] = None
    baths: Optional[int] = None
    freeCancellation: Optional[bool] = None

class PropertyOut(PropertyBase):
    id: str