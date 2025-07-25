from fastapi import APIRouter, HTTPException, status, Query, Depends
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyOut
from app.repos.property_repo import create_property, get_property, get_all_properties, search_properties, filter_properties, update_property, delete_property
from typing import List, Optional, Dict, Any
from app.core.auto_auth import get_current_user_no_auth

router = APIRouter(prefix="/properties", tags=["properties"])

@router.post("/", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
async def create_property_endpoint(property_data: PropertyCreate, current_user: dict = Depends(get_current_user_no_auth)):
    property_dict = property_data.dict()
    # Ensure the property is associated with the current user
    property_dict["userId"] = current_user.get("id", "1")
    property_id = await create_property(property_dict)
    created_property = await get_property(property_id)
    return created_property

@router.get("/{property_id}", response_model=PropertyOut)
async def get_property_endpoint(property_id: str):
    property_doc = await get_property(property_id)
    if not property_doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_doc

@router.get("/", response_model=List[PropertyOut])
async def get_properties_endpoint(
    search: Optional[str] = None,
    priceMin: Optional[float] = None,
    priceMax: Optional[float] = None,
    minRating: Optional[float] = None,
    propertyTypes: Optional[str] = None,
    amenities: Optional[str] = None
):
    # If search query is provided, use search function
    if search:
        return await search_properties(search)
    
    # If any filter is provided, use filter function
    if any([priceMin is not None, priceMax is not None, minRating is not None, propertyTypes, amenities]):
        filters = {}
        
        if priceMin is not None:
            filters["priceMin"] = priceMin
        if priceMax is not None:
            filters["priceMax"] = priceMax
        if minRating is not None:
            filters["minRating"] = minRating
            
        # Parse property types from string (e.g., "hotel:true,apartment:false")
        if propertyTypes:
            property_types_dict = {}
            for item in propertyTypes.split(','):
                if ':' in item:
                    key, value = item.split(':')
                    property_types_dict[key] = value.lower() == 'true'
            filters["propertyTypes"] = property_types_dict
            
        # Parse amenities from string (e.g., "wifi:true,pool:false")
        if amenities:
            amenities_dict = {}
            for item in amenities.split(','):
                if ':' in item:
                    key, value = item.split(':')
                    amenities_dict[key] = value.lower() == 'true'
            filters["amenities"] = amenities_dict
            
        return await filter_properties(filters)
    
    # Otherwise, return all properties
    return await get_all_properties()

@router.put("/{property_id}", response_model=PropertyOut)
async def update_property_endpoint(property_id: str, property_data: PropertyUpdate, current_user: dict = Depends(get_current_user_no_auth)):
    property_dict = property_data.dict(exclude_unset=True)
    updated = await update_property(property_id, property_dict)
    if not updated:
        raise HTTPException(status_code=404, detail="Property not found")
    return await get_property(property_id)

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property_endpoint(property_id: str, current_user: dict = Depends(get_current_user_no_auth)):
    deleted = await delete_property(property_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Property not found")