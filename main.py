from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import models
from database import engine, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LocalSkill API")

# CORS — allows React frontend at port 3000 to talk to this backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------
# Pydantic Schemas
# --------------------------

class ServiceCreate(BaseModel):
    title: str
    description: str
    role: str
    location: str
    contact: str
    user_id: int


# Separate update schema — all fields optional
class ServiceUpdate(BaseModel):
    title: str = None
    description: str = None
    role: str = None
    location: str = None
    contact: str = None


class BookingCreate(BaseModel):
    service_id: int
    name: str
    phone: str
    message: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


# --------------------------
# Root
# --------------------------

@app.get("/")
def home():
    return {"message": "LocalSkill Backend Running 🚀"}


# --------------------------
# AUTH
# --------------------------

@app.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=data.name,
        email=data.email,
        password=data.password,  # plain text for now — hash with bcrypt in production
        role=data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully", "user_id": user.id}


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    # FIX: removed verify_password() which was undefined — now does direct comparison
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"user_id": user.id, "name": user.name, "role": user.role}


# --------------------------
# SERVICES
# --------------------------

@app.get("/services/")
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()


@app.post("/services/")
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    new_service = models.Service(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


@app.put("/services/{service_id}")
def update_service(service_id: int, service: ServiceUpdate, db: Session = Depends(get_db)):
    # FIX: now uses ServiceUpdate (optional fields) instead of ServiceCreate
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()

    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    for key, value in service.dict(exclude_unset=True).items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)
    return db_service


@app.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}


# --------------------------
# BOOKINGS
# --------------------------

@app.post("/bookings/")
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    # Check if service exists
    service = db.query(models.Service).filter(models.Service.id == data.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    booking = models.Booking(
        service_id=data.service_id,
        name=data.name,
        phone=data.phone,
        message=data.message
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@app.get("/bookings/")
def get_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()
