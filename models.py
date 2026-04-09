from sqlalchemy import Column , Integer, String ,ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key= True, index= True)
    name = Column(String)
    role = Column(String)
    email =Column(String, unique=True)
    password =Column(String)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key= True, index= True)
    title = Column(String)
    description = Column(String)
    role = Column(String)
    location  = Column(String)
    contact = Column(String)

    user_id = Column(Integer,ForeignKey("user.id"))

    bookings = relationship("Booking",back_populates="service")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key = True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    name = Column(String)
    phone = Column(String)
    message = Column(String)

    created_at =  Column(DateTime, default =datetime.utcnow)
    
    service = relationship("Service",back_populates="bookings")

    
