from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    country: str
    address: str
    city: str
    state: str
    zipCode: str
    profileImage: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    profileImage: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None