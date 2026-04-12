import { PrismaPg } from "@prisma/adapter-pg";
import {
  BookingStatus,
  PaymentStatus,
  PrismaClient,
  Role,
  SlotStatus,
  SlotType,
} from "@/generated/prisma/client";
import { config } from "dotenv";
import { resolve } from "path";
import { hash } from "argon2";

// Load .env from the api root (one directory up from prisma/)
config({ path: resolve(__dirname, "../.env") });

// ── Prisma client ─────────────────────────────────────────────────────────────
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 5000,
});
const prisma = new PrismaClient({ adapter });

// ── Helpers ───────────────────────────────────────────────────────────────────
async function hashPassword(plain: string) {
  return await hash(plain, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// ── Slot definitions per floor ────────────────────────────────────────────────
const SLOT_TYPES: SlotType[] = [
  "standard", "standard", "standard", "compact", "compact", 
  "handicapped", "ev_charging", "ev_charging"
];

function buildSlots(prefix: string) {
  return SLOT_TYPES.map((type, i) => ({
    slotCode: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    slotType: type,
    status: "available" as SlotStatus,
  }));
}

// ── Main seed ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database…\n");

  // Wipe purely to ensure isolated seeding without constraints erroring over existing unique identifiers
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.parkingLot.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // ── 1. Create Users ─────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin", email: "admin@parking.local", phone: "+1-000-000-0000",
      password: await hashPassword("Admin@1234"), role: Role.admin,
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: "Jane Driver", email: "jane@parking.local", phone: "+1-111-111-1111",
      password: await hashPassword("Driver@1234"), role: Role.driver,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Builder", email: "bob@parking.local", phone: "+1-222-222-2222",
      password: await hashPassword("Driver@1234"), role: Role.driver,
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: "Alice Wonderland", email: "alice@parking.local", phone: "+1-333-333-3333",
      password: await hashPassword("Driver@1234"), role: Role.driver,
    },
  });
  console.log(`✅ Generated 4 Users (1 Admin, 3 Drivers)`);

  // ── 2. Create Vehicles ──────────────────────────────────────────────────────
  const v1 = await prisma.vehicle.create({ data: { licensePlate: "JANE-123", model: "Toyota Camry", userId: jane.id } });
  const v2 = await prisma.vehicle.create({ data: { licensePlate: "JANE-EV", model: "Tesla Model 3", userId: jane.id } });
  const v3 = await prisma.vehicle.create({ data: { licensePlate: "BOB-TRK", model: "Ford F-150", userId: bob.id } });
  const v4 = await prisma.vehicle.create({ data: { licensePlate: "ALI-001", model: "Honda Civic", userId: alice.id } });
  console.log(`✅ Generated 4 Vehicles`);

  // ── 3. Create Infrastructure ────────────────────────────────────────────────
  const lotA = await prisma.parkingLot.create({
    data: {
      name: "Downtown Parking",
      address: "1 Main Street, Downtown",
      floors: {
        create: [
          { name: "Ground Floor", level: 0, slots: { create: buildSlots("DT-G") } },
          { name: "First Floor", level: 1, slots: { create: buildSlots("DT-1") } },
          { name: "Second Floor", level: 2, slots: { create: buildSlots("DT-2") } },
        ],
      },
    },
    include: { floors: { include: { slots: true } } },
  });

  const lotB = await prisma.parkingLot.create({
    data: {
      name: "Airport Parking",
      address: "Terminal 1, International Airport",
      floors: {
        create: [
          { name: "Level P1", level: 1, slots: { create: buildSlots("AP-1") } },
          { name: "Level P2", level: 2, slots: { create: buildSlots("AP-2") } },
        ],
      },
    },
    include: { floors: { include: { slots: true } } },
  });
  console.log(`✅ Generated Infrastructure (2 Lots, 5 Floors, 40 Slots)`);

  // ── 4. Inject Bookings ──────────────────────────────────────────────────────
  const now = new Date();
  
  // Helpers
  const flatSlotsA = lotA.floors.flatMap(f => f.slots);
  const flatSlotsB = lotB.floors.flatMap(f => f.slots);

  // A) Active Booking (Bob is currently parked)
  await prisma.booking.create({
    data: {
      startTime: addHours(now, -1), endTime: addHours(now, 2), status: BookingStatus.active,
      userId: bob.id, vehicleId: v3.id, slotId: flatSlotsA[3].id,
      payments: { create: { amount: 15.0, status: PaymentStatus.completed, paidAt: addHours(now, -1), userId: bob.id } }
    }
  });
  await prisma.slot.update({ where: { id: flatSlotsA[3].id }, data: { status: "occupied" } });

  // B) Confirmed Booking (Alice has paid, hasn't arrived)
  await prisma.booking.create({
    data: {
      startTime: addHours(now, 1), endTime: addHours(now, 3), status: BookingStatus.confirmed,
      userId: alice.id, vehicleId: v4.id, slotId: flatSlotsA[4].id,
      payments: { create: { amount: 10.0, status: PaymentStatus.completed, paidAt: addHours(now, -1), userId: alice.id } }
    }
  });
  await prisma.slot.update({ where: { id: flatSlotsA[4].id }, data: { status: "reserved" } });

  // C) Pending Bookings (Jane just applied for these 2 but hasn't paid yet)
  await prisma.booking.create({
    data: {
      startTime: addHours(now, 2), endTime: addHours(now, 4), status: BookingStatus.pending,
      userId: jane.id, vehicleId: v1.id, slotId: flatSlotsB[0].id,
      payments: { create: { amount: 10.0, status: PaymentStatus.pending, userId: jane.id } }
    }
  });
  await prisma.slot.update({ where: { id: flatSlotsB[0].id }, data: { status: "reserved" } });

  await prisma.booking.create({
    data: {
      startTime: addHours(now, 2), endTime: addHours(now, 6), status: BookingStatus.pending,
      userId: jane.id, vehicleId: v2.id, slotId: flatSlotsB[6].id, // EV
      payments: { create: { amount: 20.0, status: PaymentStatus.pending, userId: jane.id } }
    }
  });
  await prisma.slot.update({ where: { id: flatSlotsB[6].id }, data: { status: "reserved" } });

  // D) Completed Bookings (Mocks historical traffic)
  for (let i = 0; i < 5; i++) {
    await prisma.booking.create({
      data: {
        startTime: addHours(now, -48 + i), endTime: addHours(now, -46 + i), status: BookingStatus.completed,
        userId: bob.id, vehicleId: v3.id, slotId: flatSlotsA[10 + i].id,
        payments: { create: { amount: 10.0, status: PaymentStatus.completed, paidAt: addHours(now, -48 + i), userId: bob.id } }
      }
    });
  }

  // E) Cancelled Booking
  await prisma.booking.create({
    data: {
      startTime: addHours(now, -5), endTime: addHours(now, -3), status: BookingStatus.cancelled,
      userId: alice.id, vehicleId: v4.id, slotId: flatSlotsA[5].id, // Slot freed
      payments: { create: { amount: 10.0, status: PaymentStatus.failed, userId: alice.id } }
    }
  });

  console.log(`✅ Generated 11 Bookings across varying lifecycle states & $105+ in registered payments`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n  Credentials:");
  console.log("  ┌─────────────────────────────────────────────┐");
  console.log("  │  Admin   admin@parking.local  Admin@1234    │");
  console.log("  │  Driver  jane@parking.local   Driver@1234   │");
  console.log("  │  Driver  bob@parking.local    Driver@1234   │");
  console.log("  │  Driver  alice@parking.local  Driver@1234   │");
  console.log("  └─────────────────────────────────────────────┘\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
