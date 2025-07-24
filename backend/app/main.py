from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import booking, property, user

app = FastAPI(title="BookNest API", description="API for the BookNest hotel booking application")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(booking.router)
app.include_router(property.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the BookNest API"}