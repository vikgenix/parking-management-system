# SDLC Plan — Parking Lot Management System

## Model: Agile (Iterative Sprints)

Agile was chosen because:
- Requirements may evolve (e.g. adding EV charging slots, monthly passes)
- Early working software is more valuable than complete documentation
- The system can be demo-ed to stakeholders sprint by sprint

---

## Phase 1 — Planning

**Goal:** Define scope, actors, and core features.

**Actors:**
- Driver — books and pays for parking
- Admin — manages lots, floors, slots, views reports, and checks vehicles in and out at the gate

**Core Features (MVP):**
- User registration and login (JWT auth)
- Browse parking lots and available slots
- Book a slot with start/end time
- Pay via Stripe
- Auto-release slot if payment not made in 15 minutes
- Admin dashboard for lot and slot management

**Out of scope for MVP:**
- Mobile app
- Monthly subscription passes
- License plate recognition
- Dynamic pricing

---

## Phase 2 — System Design

**Architecture:** 3-tier (Client → API → Database)

**Design Patterns selected:**
1. Observer Pattern — booking lifecycle events (notifications, slot updates, audit logs)
2. Repository Pattern — decouples services from database queries
3. Strategy Pattern (planned) — payment strategies (Stripe, cash, UPI)

**OOP Principles applied:**
| Principle | Where |
|---|---|
| Abstraction | BaseEntity, IBookable, IPayable, IRepository interfaces |
| Encapsulation | User password is private; slot status changed only via reserve()/release() |
| Inheritance | Driver and Admin extend User |
| Polymorphism | All observers called via handle(); slots implement IBookable |

**SOLID Principles:**
| Principle | Application |
|---|---|
| Single Responsibility | Each service class has one job (BookingService only handles bookings) |
| Open/Closed | New notification channels = new Observer class, no existing code changed |
| Liskov Substitution | Admin can replace User anywhere User is expected |
| Interface Segregation | IBookable and IPayable are separate — not every entity needs both |
| Dependency Inversion | Services depend on IRepository, not concrete Beanie Document classes |

---

## Phase 3 — Implementation Sprints

### Sprint 1 (Days 1–3): Foundation
- [x] Folder structure
- [x] Base models and class hierarchy
- [x] Observer pattern implementation
- [x] Repository interfaces + in-memory implementations
- [x] ER diagram

### Sprint 2 (Days 4–7): Core Backend
- [ ] Beanie MongoDB Document models
- [ ] Auth service (register, login, JWT)
- [ ] Slot service with Redis cache
- [ ] Booking service (create, cancel)

### Sprint 3 (Days 8–11): Payments + Frontend Shell
- [ ] Stripe payment integration
- [ ] Celery task: auto-expire unpaid bookings
- [ ] Next.js login and register pages
- [ ] Driver slot grid and booking form

### Sprint 4 (Days 12–14): Admin + Polish
- [ ] Admin dashboard (lots, slots, reports)
- [ ] Unit tests for BookingService
- [ ] Error handling and input validation
- [ ] README updated with API docs

---

## Phase 4 — Testing

**Unit tests:** BookingService, SlotService, AuthService
**Integration tests:** Full booking flow (reserve → pay → confirm)
**Manual testing:** Swagger UI for all endpoints

**Test strategy:**
- In-memory repositories used in unit tests (no DB dependency)
- pytest + pytest-asyncio for async FastAPI routes

---

## Phase 5 — Deployment (Post-MVP)

- Docker Compose for local
- GitHub Actions CI (lint + test on every push)
- Target: Railway or Render for backend, Vercel for frontend

---

## Progress Tracking

| Milestone | Target Date | Status |
|---|---|---|
| Repo setup + base classes | Day 1 | Done |
| Core backend (auth + booking) | Day 7 | In progress |
| 40% core functionality | 10 April | Target |
| Full MVP | End of April | Planned |
