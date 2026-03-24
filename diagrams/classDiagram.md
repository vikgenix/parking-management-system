# Database Design — Parking Lot Management System

## Entities and Relationships

### Cardinality Summary

| Relationship | Type | Explanation |
|---|---|---|
| USER → BOOKINGS | One-to-Many (1:N) | One user can make many bookings |
| USER → VEHICLES | One-to-Many (1:N) | One user can register many vehicles |
| VEHICLE → BOOKINGS | One-to-Many (1:N) | One vehicle can appear in many bookings |
| PARKING_LOT → FLOORS | One-to-Many (1:N) | One lot has one or more floors |
| FLOOR → SLOTS | One-to-Many (1:N) | One floor has many slots |
| SLOT → BOOKINGS | One-to-Many (1:N) | One slot can have many bookings (across time) |
| BOOKING → PAYMENT | One-to-One (1:1) | Each booking has at most one payment record |

---

## Table Definitions

### USERS
Primary actor table. Stores drivers, admins, and operators.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | Auto-generated |
| name | VARCHAR(100) | NOT NULL | 
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| phone | VARCHAR(20) | NOT NULL | For SMS notifications |
| password_hash | TEXT | NOT NULL | bcrypt hash — never plain text |
| role | ENUM | NOT NULL | driver / admin / operator |
| is_active | BOOLEAN | DEFAULT true | Soft disable accounts |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

---

### VEHICLES
Registered vehicles belonging to a driver.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → USERS.id | |
| plate_number | VARCHAR(20) | UNIQUE, NOT NULL | Stored uppercase |
| vehicle_type | VARCHAR(50) | NOT NULL | car / bike / suv |
| model | VARCHAR(100) | | e.g. Honda City |
| created_at | TIMESTAMP | DEFAULT now() | |

---

### PARKING_LOTS
Top-level entity representing a physical parking facility.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| name | VARCHAR(150) | NOT NULL | e.g. Central Park Parking |
| address | TEXT | NOT NULL | Full address |
| price_per_hour | DECIMAL(8,2) | NOT NULL | Base rate |
| total_floors | INT | DEFAULT 1 | |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT now() | |

---

### FLOORS
A floor within a parking lot.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| lot_id | UUID | FK → PARKING_LOTS.id | |
| floor_number | INT | NOT NULL | 0 = ground, 1 = first, etc. |
| label | VARCHAR(20) | | e.g. "G", "L1", "Basement" |
| created_at | TIMESTAMP | DEFAULT now() | |

---

### SLOTS
Individual parking spaces. Status managed via Redis cache for performance.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| floor_id | UUID | FK → FLOORS.id | |
| slot_code | VARCHAR(20) | NOT NULL | e.g. "A-101" |
| slot_type | ENUM | NOT NULL | standard / compact / handicapped / ev_charging |
| status | ENUM | DEFAULT available | available / reserved / occupied / inactive |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

**Index:** `(floor_id, status)` — for fast availability queries

---

### BOOKINGS
Central transaction table linking users, slots, and vehicles.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → USERS.id | |
| slot_id | UUID | FK → SLOTS.id | |
| vehicle_id | UUID | FK → VEHICLES.id | |
| start_time | TIMESTAMP | NOT NULL | |
| end_time | TIMESTAMP | NOT NULL | |
| status | ENUM | DEFAULT pending | pending / confirmed / active / completed / cancelled / expired |
| total_amount | DECIMAL(10,2) | NOT NULL | Calculated at creation |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

**Business rule:** A slot cannot have two ACTIVE bookings at overlapping times.
**Index:** `(slot_id, status)` — for availability conflict checks

---

### PAYMENTS
One payment record per booking. Created when driver initiates checkout.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK | |
| booking_id | UUID | FK → BOOKINGS.id, UNIQUE | One payment per booking |
| stripe_payment_id | VARCHAR(255) | | From Stripe API response |
| amount | DECIMAL(10,2) | NOT NULL | |
| status | ENUM | DEFAULT pending | pending / paid / failed / refunded |
| paid_at | TIMESTAMP | NULLABLE | Set when payment completes |
| created_at | TIMESTAMP | DEFAULT now() | |

---

## Enum Definitions

```sql
CREATE TYPE user_role     AS ENUM ('driver', 'admin', 'operator');
CREATE TYPE slot_type     AS ENUM ('standard', 'compact', 'handicapped', 'ev_charging');
CREATE TYPE slot_status   AS ENUM ('available', 'reserved', 'occupied', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
```

---

## Key Design Decisions

1. **UUID primary keys** — avoids sequential ID enumeration attacks; safe to expose in URLs.
2. **Soft deletes via `is_active`** — lots and users are never hard-deleted; historical bookings remain intact.
3. **Redis mirrors slot status** — `SLOTS.status` is the source of truth; Redis caches it for low-latency availability reads.
4. **`total_amount` stored on booking** — price_per_hour may change; the amount at booking time is preserved.
5. **UNIQUE on `PAYMENTS.booking_id`** — database-level enforcement of the 1:1 booking → payment rule.
