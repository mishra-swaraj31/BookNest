from bson import ObjectId
from typing import List, Optional
from app.core.db import get_db

async def create_property(property_data: dict) -> str:
    db = get_db()
    result = await db.properties.insert_one(property_data)
    return str(result.inserted_id)

async def get_property(property_id: str) -> Optional[dict]:
    db = get_db()
    property_doc = await db.properties.find_one({"_id": ObjectId(property_id)})
    if property_doc:
        property_doc["id"] = str(property_doc["_id"])
    return property_doc

async def get_all_properties() -> List[dict]:
    db = get_db()
    properties = await db.properties.find().to_list(length=100)
    for property_doc in properties:
        property_doc["id"] = str(property_doc["_id"])
    return properties

async def search_properties(query: str) -> List[dict]:
    db = get_db()
    # Search in title and description
    properties = await db.properties.find({
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"location": {"$regex": query, "$options": "i"}}
        ]
    }).to_list(length=100)
    
    for property_doc in properties:
        property_doc["id"] = str(property_doc["_id"])
    return properties

async def filter_properties(filters: dict) -> List[dict]:
    db = get_db()
    query = {}
    
    # Price range filter
    if "priceMin" in filters and "priceMax" in filters:
        query["price"] = {"$gte": filters["priceMin"], "$lte": filters["priceMax"]}
    
    # Property type filter based on title
    if "propertyTypes" in filters and filters["propertyTypes"]:
        property_types = []
        for prop_type, selected in filters["propertyTypes"].items():
            if selected:
                property_types.append({"title": {"$regex": prop_type, "$options": "i"}})
        if property_types:
            query["$or"] = property_types
    
    # Amenities filter
    if "amenities" in filters and filters["amenities"]:
        for amenity, selected in filters["amenities"].items():
            if selected:
                query[f"amenities.{amenity}"] = True
    
    # Rating filter
    if "minRating" in filters:
        query["rating"] = {"$gte": filters["minRating"]}
    
    properties = await db.properties.find(query).to_list(length=100)
    for property_doc in properties:
        property_doc["id"] = str(property_doc["_id"])
    return properties

async def update_property(property_id: str, property_data: dict) -> bool:
    db = get_db()
    result = await db.properties.update_one(
        {"_id": ObjectId(property_id)},
        {"$set": property_data}
    )
    return result.modified_count > 0

async def delete_property(property_id: str) -> bool:
    db = get_db()
    result = await db.properties.delete_one({"_id": ObjectId(property_id)})
    return result.deleted_count > 0