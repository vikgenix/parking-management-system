# Parking Lot Management System
 
A full-stack web application to manage parking lots, slots, bookings, and payments — built with FastAPI, Next.js, and MongoDB.
 
---
 
## What it does
 
- Drivers can view available slots, book a spot, and pay online
- Admins can manage parking lots, floors, slot availability, and check vehicles in and out
- The system auto-releases unpaid bookings after 15 minutes
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | MongoDB (Async ODM: Beanie / Motor) |
| Cache | Redis |
| Payments | Stripe |
| Auth | JWT (JSON Web Tokens) |
| Background jobs | Celery |
 
---