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
Primary actor table. Stores drivers and admins.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | Document ID |
| name | String | Required | |
| email | String | Unique, Required | Login identifier |
| phone | String | Required | For SMS notifications |
| password_hash | String | Required | bcrypt hash — never plain text |
| role | Enum | Required | driver / admin |
| is_active | Boolean | Default: true | Soft disable accounts |
| created_at | DateTime | Default: now() | |
| updated_at | DateTime | Default: now() | |

---

### VEHICLES
Registered vehicles belonging to a driver.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| user_id | Link[User] | Ref | Beanie Link to User document |
| plate_number | String | Unique, Required | Stored uppercase |
| vehicle_type | String | Required | car / bike / suv |
| model | String | Optional | e.g. Honda City |
| created_at | DateTime | Default: now() | |

---

### PARKING_LOTS
Top-level entity representing a physical parking facility.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| name | String | Required | e.g. Central Park Parking |
| address | String | Required | Full address |
| price_per_hour | Decimal | Required | Base rate |
| total_floors | Integer | Default: 1 | |
| is_active | Boolean | Default: true | |
| created_at | DateTime | Default: now() | |

---

### FLOORS
A floor within a parking lot.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| lot_id | Link[ParkingLot] | Ref | Beanie Link to ParkingLot |
| floor_number | Integer | Required | 0 = ground, 1 = first, etc. |
| label | String | Optional | e.g. "G", "L1", "Basement" |
| created_at | DateTime | Default: now() | |

---

### SLOTS
Individual parking spaces. Status managed via Redis cache for performance.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| floor_id | Link[Floor] | Ref | Beanie Link to Floor |
| slot_code | String | Required | e.g. "A-101" |
| slot_type | Enum | Required | standard / compact / handicapped / ev_charging |
| status | Enum | Default: available | available / reserved / occupied / inactive |
| created_at | DateTime | Default: now() | |
| updated_at | DateTime | Default: now() | |

**Index:** COMPOUND `[("floor_id", 1), ("status", 1)]` — for fast availability queries

---

### BOOKINGS
Central transaction table linking users, slots, and vehicles.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| user_id | Link[User] | Ref | |
| slot_id | Link[Slot] | Ref | |
| vehicle_id | Link[Vehicle] | Ref | |
| start_time | DateTime | Required | |
| end_time | DateTime | Required | |
| status | Enum | Default: pending | pending / confirmed / active / completed / cancelled / expired |
| total_amount | Decimal | Required | Calculated at creation |
| created_at | DateTime | Default: now() | |
| updated_at | DateTime | Default: now() | |

**Business rule:** A slot cannot have two ACTIVE bookings at overlapping times.
**Index:** COMPOUND `[("slot_id", 1), ("status", 1)]` — for availability conflict checks

---

### PAYMENTS
One payment record per booking. Created when driver initiates checkout.

| Field | Type | Options | Notes |
|---|---|---|---|
| _id | ObjectId | Auto | |
| booking_id | Link[Booking] | Unique, Ref | One payment per booking |
| stripe_payment_id | String | Optional | From Stripe API response |
| amount | Decimal | Required | |
| status | Enum | Default: pending | pending / paid / failed / refunded |
| paid_at | DateTime | Optional | Set when payment completes |
| created_at | DateTime | Default: now() | |

---

## Enum Definitions

```sql
CREATE TYPE user_role     AS ENUM ('driver', 'admin');
CREATE TYPE slot_type     AS ENUM ('standard', 'compact', 'handicapped', 'ev_charging');
CREATE TYPE slot_status   AS ENUM ('available', 'reserved', 'occupied', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
```

---

## Key Design Decisions

1. **ObjectId primary keys** — standard MongoDB convention; fast index lookups.
2. **Soft deletes via `is_active`** — lots and users are never hard-deleted; historical bookings remain intact.
3. **Redis mirrors slot status** — MongoDB Document is the source of truth; Redis caches it for low-latency availability reads.
4. **`total_amount` stored on booking** — price_per_hour may change; the amount at booking time is preserved.
5. **UNIQUE index on `PAYMENTS.booking_id`** — collection-level enforcement of the 1:1 booking → payment rule.
