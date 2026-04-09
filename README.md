LocalSkill

LocalSkill is a full-stack web application to list, search, and book local services.

Features

- Add services with title, description, role, location, and contact
- Search and view available services
- Book a service with user details
- Basic authentication (signup and login)

Accessibility

- Simple and clean UI for easy navigation
- Mobile-friendly layout
- Minimal input fields for faster interaction
- Clear labels for forms and actions

Scalability

- Modular backend using FastAPI
- REST API structure allows easy frontend expansion
- Database schema designed for extension (users, services, bookings)
- Can be upgraded to cloud database and deployment

Unique Aspects

- Supports both user and service provider roles in a single system
- Direct booking without complex workflows
- Lightweight architecture for fast performance
- Easy to extend with features like dashboard, reviews, and payments

Tech Stack

- Frontend: React.js
- Backend: FastAPI, SQLAlchemy
- Database: SQLite

Setup

Backend

cd backend
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload

Frontend

cd frontend
npm install
npm start

API Endpoints

- POST /signup/
- POST /login/
- GET /services/
- POST /services/
- POST /bookings/

Notes

- Authentication is basic (no password hashing or tokens)
- Database resets if schema changes

Author

Vishnu Mohan
