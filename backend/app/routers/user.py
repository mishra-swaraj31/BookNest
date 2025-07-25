from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserUpdate, UserOut, UserLogin, Token
from app.repos.user_repo import create_user, get_user, get_user_by_email, authenticate_user, update_user, delete_user
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings
from app.core.auto_auth import get_current_user_no_auth

router = APIRouter(prefix="/users", tags=["users"])

# JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/token")

# JWT Token functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(user: UserCreate):
    user_dict = user.dict()
    user_id = await create_user(user_dict)
    if not user_id:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = await get_user(user_id)
    return created_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # For demo purposes, we'll always return a valid token
    # Get the default user
    user = await get_user_by_email("sophia.smith@example.com")
    
    # If user doesn't exist, create a default response
    if not user:
        user = {"email": "sophia.smith@example.com"}
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user_no_auth)):
    return current_user

@router.get("/{user_id}", response_model=UserOut)
async def get_user_endpoint(user_id: str):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserOut)
async def update_user_endpoint(user_data: UserUpdate, current_user: dict = Depends(get_current_user_no_auth)):
    user_dict = user_data.dict(exclude_unset=True)
    updated = await update_user(current_user["id"], user_dict)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return await get_user(current_user["id"])

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(current_user: dict = Depends(get_current_user_no_auth)):
    deleted = await delete_user(current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")