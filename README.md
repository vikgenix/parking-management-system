# Parking Lot Management System

A full-stack monorepo application to manage parking lots, slots, bookings, and payments. 

---

## What it does -

- Drivers can view available slots, book a spot, and pay online
- Admins can manage parking lots, floors, slot availability, and check vehicles in and out
- The system auto-releases unpaid bookings after 15 minutes

---

## Project Structure -

This project is structured as a monorepo using **Turborepo** and **Bun**:

```text
parking-management-system/
├── apps/
│   ├── web/        # Frontend web application (TanStack Start)
│   └── api/        # Backend server (FastAPI, Python)
├── packages/       # Shared configurations (eslint, typescript configs)
├── diagrams/       # Mermaid.js architecture diagrams
├── docs/           # System documentation (SDLC, OOP Concepts)
└── package.json    # Root workspace configuration