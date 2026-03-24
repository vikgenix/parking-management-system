erDiagram
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ VEHICLES : registers
    VEHICLES ||--o{ BOOKINGS : "appears in"
    PARKING_LOTS ||--o{ FLOORS : has
    FLOORS ||--o{ SLOTS : contains
    SLOTS ||--o{ BOOKINGS : has
    BOOKINGS ||--o| PAYMENTS : has

    USERS {
        UUID id PK
        VARCHAR name
        VARCHAR email "UNIQUE"
        VARCHAR phone
        TEXT password_hash
        ENUM role
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    VEHICLES {
        UUID id PK
        UUID user_id FK
        VARCHAR plate_number "UNIQUE"
        VARCHAR vehicle_type
        VARCHAR model
        TIMESTAMP created_at
    }

    PARKING_LOTS {
        UUID id PK
        VARCHAR name
        TEXT address
        DECIMAL price_per_hour
        INT total_floors
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    FLOORS {
        UUID id PK
        UUID lot_id FK
        INT floor_number
        VARCHAR label
        TIMESTAMP created_at
    }

    SLOTS {
        UUID id PK
        UUID floor_id FK
        VARCHAR slot_code
        ENUM slot_type
        ENUM status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    BOOKINGS {
        UUID id PK
        UUID user_id FK
        UUID slot_id FK
        UUID vehicle_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        ENUM status
        DECIMAL total_amount
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    PAYMENTS {
        UUID id PK
        UUID booking_id FK "UNIQUE"
        VARCHAR stripe_payment_id
        DECIMAL amount
        ENUM status
        TIMESTAMP paid_at
        TIMESTAMP created_at
    }
