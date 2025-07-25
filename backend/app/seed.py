import asyncio
import json
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.db import db
from app.repos.user_repo import create_user
from app.repos.property_repo import create_property
from app.repos.booking_repo import create_booking

db = db  # Already imported from app.core.db

async def seed_database():
    print("Starting database seeding...")
    
    # Get database connection
    database = db
    
    # Clear existing collections
    await database.users.delete_many({})
    await database.properties.delete_many({})
    await database.bookings.delete_many({})
    
    print("Cleared existing collections")
    
    # Load data from JSON files
    frontend_dir = Path(__file__).parent.parent.parent / "frontend" / "src" / "app" / "data"
    
    # Seed users
    try:
        with open(frontend_dir / "user.json", "r") as f:
            user_data = json.load(f)
            
        # Add a password for the user
        user_data["password"] = "password123"
        
        # Ensure the email is set to our default user email
        user_data["email"] = "sophia.smith@example.com"
        
        user_id = await create_user(user_data)
        print(f"Seeded user with ID: {user_id}")
    except Exception as e:
        print(f"Error seeding user: {e}")
    
    # Seed properties
    try:
        with open(frontend_dir / "properties.json", "r") as f:
            properties_data = json.load(f)
            
        for property_data in properties_data:
            property_id = await create_property(property_data)
            print(f"Seeded property: {property_data['title']} with ID: {property_id}")
    except Exception as e:
        print(f"Error seeding properties: {e}")
    
    # Seed bookings
    try:
        with open(frontend_dir / "bookings.json", "r") as f:
            bookings_data = json.load(f)
            
        for booking_data in bookings_data:
            # Convert bookingRef to bookingReference to match our schema
            if "bookingRef" in booking_data:
                booking_data["bookingReference"] = booking_data.pop("bookingRef")
                
            booking_id = await create_booking(booking_data)
            print(f"Seeded booking with ID: {booking_id}")
    except Exception as e:
        print(f"Error seeding bookings: {e}")
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_database())