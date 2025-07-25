import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

from app.seed import seed_database

DATA_DIR = os.path.join(os.path.dirname(__file__), '../frontend/src/app/data')

async def seed_collection(db, collection_name, file_name):
    file_path = os.path.join(DATA_DIR, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # If it's a dict, wrap in a list
        if isinstance(data, dict):
            data = [data]
        # Remove existing data
        await db[collection_name].delete_many({})
        # Insert new data
        if data:
            await db[collection_name].insert_many(data)

async def seed_database():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    await seed_collection(db, 'users', 'user.json')
    await seed_collection(db, 'properties', 'properties.json')
    await seed_collection(db, 'bookings', 'bookings.json')
    print("Database seeded successfully.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())