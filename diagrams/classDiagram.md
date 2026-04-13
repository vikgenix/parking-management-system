# Database Design — Parking Lot Management System

## Entities and Relationships

Here is the exact Mermaid Class Diagram modeled strictly 1:1 against the underlying PostgreSQL `schema.prisma` architecture. 

It strips away all outdated MongoDB/Beanie abstractions and strictly reflects the exact Typescript ORM types (like UUIDs, native enums, and foreign key relations).

```mermaid
classDiagram
  class User {
    +String id
    +String name
    +String email
    +String phone
    +String password
    +String picture
    +Role role
    +Boolean isActive
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Session {
    +String id
    +String userAgent
    +String browser
    +String os
    +String device
    +String location
    +String ipAddress
    +DateTime expiresAt
    +DateTime createdAt
    +DateTime updatedAt
    +DateTime lastActiveAt
    +String userId
  }

  class ParkingLot {
    +String id
    +String name
    +String address
    +DateTime createdAt
    +DateTime updatedAt
  }

  class Floor {
    +String id
    +String name
    +Int level
    +DateTime createdAt
    +DateTime updatedAt
    +String parkingLotId
  }

  class Slot {
    +String id
    +String slotCode
    +SlotType slotType
    +SlotStatus status
    +DateTime createdAt
    +DateTime updatedAt
    +String floorId
  }

  class Vehicle {
    +String id
    +String licensePlate
    +String model
    +DateTime createdAt
    +DateTime updatedAt
    +String userId
  }

  class Booking {
    +String id
    +DateTime startTime
    +DateTime endTime
    +BookingStatus status
    +DateTime createdAt
    +DateTime updatedAt
    +String userId
    +String vehicleId
    +String slotId
  }

  class Payment {
    +String id
    +Float amount
    +PaymentStatus status
    +DateTime createdAt
    +DateTime paidAt
    +String userId
    +String bookingId
  }

  %% Cardinality & Relationships
  User "1" *-- "0..n" Session : authenticates via
  User "1" *-- "0..n" Vehicle : owns
  User "1" *-- "0..n" Booking : makes
  User "1" *-- "0..n" Payment : pays

  ParkingLot "1" *-- "1..n" Floor : contains
  Floor "1" *-- "1..n" Slot : contains

  Vehicle "1" <-- "0..n" Booking : linked to
  Slot "1" <-- "0..n" Booking : reserves

  Booking "1" *-- "0..n" Payment : transaction for
```

---

## Enum Definitions

The ORM enforces strict enumeration constraints across the database schema:

```sql
CREATE TYPE Role           AS ENUM ('driver', 'admin');
CREATE TYPE SlotType       AS ENUM ('standard', 'compact', 'handicapped', 'ev_charging');
CREATE TYPE SlotStatus     AS ENUM ('available', 'reserved', 'occupied', 'inactive');
CREATE TYPE BookingStatus  AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');
CREATE TYPE PaymentStatus  AS ENUM ('pending', 'completed', 'failed', 'refunded');
```

