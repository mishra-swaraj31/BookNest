from fastapi import Depends, Request
from app.repos.user_repo import get_user_by_email

# Default user email that will be used for all requests
DEFAULT_USER_EMAIL = "sophia.smith@example.com"

async def get_current_user_no_auth():
    """
    This function bypasses authentication and returns a default user.
    It's used for demo purposes to show how the system allows users to book hotels
    without requiring authentication.
    """
    # Get the default user from the database
    user = await get_user_by_email(DEFAULT_USER_EMAIL)
    
    # If user doesn't exist in the database, return a default user object
    if not user:
        user = {
            "id": "1",
            "firstName": "Sophia",
            "lastName": "Smith",
            "email": DEFAULT_USER_EMAIL,
            "phone": "+1 (555) 123-4567",
            "country": "United States",
            "address": "123 Main Street",
            "city": "San Francisco",
            "state": "CA",
            "zipCode": "94101",
            "profileImage": "assets/profile.png"
        }
    
    return user