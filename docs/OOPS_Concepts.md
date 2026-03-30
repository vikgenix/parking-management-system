# OOP Concepts — Parking Lot Management System

## 1. Abstraction

Hiding complex implementation behind simple interfaces.

**Where used:**

- `BaseEntity` — abstract class forcing every model to implement `to_dict()`
- `IBookable` — abstract interface with `is_available()`, `reserve()`, `release()`
- `IPayable` — abstract interface with `calculate_amount()`, `mark_paid()`
- `IRepository` — abstract CRUD interface hiding all database logic
- `BookingObserver` — abstract observer hiding notification implementation

```python
class IBookable(ABC):
    @abstractmethod
    def is_available(self) -> bool: pass

    @abstractmethod
    def reserve(self) -> None: pass
```

---

## 2. Encapsulation

Bundling data and methods together; restricting direct access to internal state.

**Where used:**

- `User._password_hash` — double underscore makes it truly private in Python
- `ParkingSlot.status` — can only change via `reserve()`, `release()`, `occupy()`
- `BaseEntity._id` — exposed only via read-only `@property`

```python
class User(BaseEntity):
    def __init__(self, ...):
        self.__password_hash = password_hash  # private — name-mangled

    def verify_password(self, hash: str) -> bool:
        return self.__password_hash == hash   # comparison stays inside class
```

---

## 3. Inheritance

Child classes reuse and extend parent class behaviour.

**Hierarchy:**

```
BaseEntity (abstract)
├── User
│   ├── Driver      — adds vehicles list, add_vehicle()
│   └── Admin       — overrides notify() to alert all channels
├── ParkingLot
├── Floor
├── ParkingSlot     — also implements IBookable
├── Booking         — also implements IPayable
└── Payment
```

```python
class Admin(User):
    def notify(self, message: str, channel: str = "email") -> None:
        for ch in ["email", "sms", "dashboard"]:   # extends parent behaviour
            print(f"[{ch.upper()}] → {self._email}: {message}")
```

---

## 4. Polymorphism

Different classes respond to the same method call in different ways.

**Where used:**

**a) Method overriding — notify():**

```python
user    = User(...)
admin   = Admin(...)
driver  = Driver(...)

# All three have notify() — each behaves differently
user.notify("msg")    # sends email only
admin.notify("msg")   # sends email + sms + dashboard
```

**b) Duck typing via interfaces:**

```python
# BookingEventPublisher doesn't care which observer it calls
for observer in self._observers:
    observer.handle(event)   # could be Email, SMS, Audit — all respond the same way
```

**c) IBookable polymorphism:**

```python
def process_booking(bookable: IBookable):
    if bookable.is_available():
        bookable.reserve()   # works for ParkingSlot or any future bookable type
```

---

## 5. Multiple Inheritance

`ParkingSlot` extends both `BaseEntity` and `IBookable`:

```python
class ParkingSlot(BaseEntity, IBookable):
    # Gets id, created_at, to_dict() from BaseEntity
    # Must implement is_available(), reserve(), release() from IBookable
```

---

## 6. Abstract Classes vs Interfaces

|                         | Abstract Class                | Interface (ABC with all abstract methods) |
| ----------------------- | ----------------------------- | ----------------------------------------- |
| Example                 | `BaseEntity`                  | `IBookable`, `IPayable`, `IRepository`    |
| Can have implementation | Yes — `touch()`, `__repr__()` | No — all methods abstract                 |
| Purpose                 | Shared base behaviour         | Contract / capability                     |

---

## Summary Table

| OOP Concept          | Class / File                                 | Line(s)                                              |
| -------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Abstraction          | `BaseEntity`, `IBookable`, `IPayable`        | `src/models/base.py`                                 |
| Encapsulation        | `User.__password_hash`, `ParkingSlot.status` | `src/models/base.py`                                 |
| Inheritance          | `Driver` and `Admin` extend `User`           | `src/models/base.py`                                 |
| Polymorphism         | `notify()` override, Observer `handle()`     | `src/models/base.py`, `src/core/observer_pattern.py` |
| Multiple Inheritance | `ParkingSlot(BaseEntity, IBookable)`         | `src/models/base.py`                                 |
| Design Pattern       | Observer Pattern                             | `src/core/observer_pattern.py`                       |
| Repository Pattern   | `IRepository`, `InMemoryUserRepository`      | `src/repositories/interfaces.py`                     |
