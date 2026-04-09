from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import models
from database import engine, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS (VERY IMPORTANT)
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
# 📦 Pydantic Schemas
# --------------------------

class ServiceCreate(BaseModel):
    title: str
    description: str
    role: str
    location: str
    contact: str
    user_id:int


class BookingCreate(BaseModel):
    service_id: int
    name: str
    phone: str
    message: str
    
class LoginRequest(BaseModel):
    email:str
    password: str

class SignupRequest(BaseModel):
    name:str
    email: str
    password: str
    role:str
# --------------------------
# 🏠 Root
# --------------------------

@app.get("/")
def home():
    return {"message": "LocalSkill Backend Running 🚀"}


# --------------------------
# 🔧 SERVICES
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
def update_service(service_id: int, service: ServiceCreate, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()

    if not db_service:
        return {"error": "Service not found"}

    for key, value in service.dict().items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)

    return db_service


@app.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()

    if not service:
        return {"error": "Service not found"}

    db.delete(service)
    db.commit()

    return {"message": "Service deleted"}


# --------------------------
# 📩 BOOKINGS
# --------------------------

@app.post("/bookings/")
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
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
    return db.query(models.Booking).all()

@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not verify_password(data.password,user.password):
        return {"error":"Invalid credentials"}
    return {"user_id":user.id, "name":user.name}

@app.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    user = models.User(
        name=data.name,
        email=data.email,
        password=data.password,
        role= data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message":"User created"}
