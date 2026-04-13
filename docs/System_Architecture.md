# System Design Principles & Architecture

This repository operates on a modernized 3-tier architecture using a strict monorepo layout powered by Turborepo. It splits responsibilities distinctly across the Database, the Backend API Service (`apps/api`), and the Frontend Dashboard (`apps/web`).

## 1. Monolithic Repository (Monorepo)
- **Tooling**: Turborepo handles task orchestration.
- **Benefits**: Shared configuration semantics (`packages/eslint-config`, `packages/typescript-config`), unified `package.json` dependency resolutions, and a cohesive developer pipeline. Modifications spanning both frontend logic and backend schemas exist cleanly in a single code commit.

## 2. Backend Design (`apps/api`)
The Node.js/Express.js backend heavily adheres to **SOLID** object-oriented programming conventions. 

### A. Separation of Concerns (N-Tiered Structure)
Each distinct domain (e.g., `booking`, `admin`, `vehicle`) operates out of uniquely bounded contexts located in `src/modules`. 
Inside each module, separation exists across:
- **Router (`booking.router.ts`)**: Defines the endpoint map and HTTP method allocations.
- **Controller (`booking.controller.ts`)**: Ingests HTTP `req/res`, validates inputs, formats outputs, and catches fatal exceptions.
- **Service (`booking.service.ts`)**: Completely abstracted from Express. Handles strict business state manipulation and transactional safety via Prisma.

### B. Dependency Injection Layer
The system uses manual Dependency Injection. Instead of hardcoding Database interactions across files, a dedicated container logic map (`[module].container.ts`) wires up independent `Repositories`, `TokenServices`, and `AuthGuardServices`, directly passing them to the instantiated `Controllers` and `Services` via constructors. This allows straightforward Unit Mocking without touching database sockets.

### C. Repository Pattern (`src/entities`)
When standard Database interactions become complex, they are moved to localized Repositories. Instead of exposing `prisma.user` directly to the `userService`, `PrismaUserRepository` implements an `IUserRepository` interface, ensuring that the backing ORM can be swapped independently of the REST implementation.

### D. Centralized Error Handling
Components never crash raw node processes. All logical assertions throw a unified `AppError`. The Express chain routes all exceptions to an intelligent `errorResolver` which sanitizes DB stacks and transforms them to normalized HTTP response signatures (e.g., Status `400` vs Status `500`).

## 3. Security & Access Control
- **Role-Based Access Control (RBAC)**: Stored as Postgres ENUM definitions (`Admin` vs `Driver`).
- **Auth Middleware**: A centralized API gatekeeper reads `Bearer` JWT Tokens from incoming headers, decrypts the session signatures mapping to active database references, and establishes `req.user`. It exposes an arbitrary flag (`adminOnly`), shielding specific route branches against standard-level drivers generating `401 Unauthorized`.

## 4. Frontend Design (`apps/web`)
The Dashboard is built using React / Vite, and operates off modern SSR-enabled components.

### A. File-based Routing
`@tanstack/react-router` generates strongly typed routing maps. Navigational files reflect exactly as they sit mapped on the web URI (`routes/book-slot.tsx` -> `/book-slot`).

### B. Defensive Server-Side Rendering (SSR) Guards
Since TanStack enables server-first executions, interacting with Client objects originally creates Reference Exception violations. All native browser invocations (e.g., `localStorage.getItem("token")`) are forcefully wrapped behind `typeof window !== "undefined"` safety bindings to ensure safe hydrations across both environments.

### C. Conditional UI Branching
Rather than executing huge client component conditionals depending on user states, the React tree cleanly splits layouts early based on the `role` parsed from localized Storage. Admins map to a wide system-view `AdminDashboard` layout, while Drivers load a sandboxed `DriverDashboard` directly on the `/` root. 

### D. CSS Design Tokenization
Minimalist UI boundaries are achieved without massive external libraries by isolating thematic colors into global CSS tokens (`index.css` -> `--sea-ink`, `--surface-strong`). This facilitates rapid native light/ dark toggle mappings.
