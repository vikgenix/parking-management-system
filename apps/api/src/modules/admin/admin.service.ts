import { IFloorRepository } from "@/entities/floor/floor.repository";
import { DBFloor } from "@/entities/floor/floor.types";
import { IParkingLotRepository } from "@/entities/parking-lot/parking-lot.repository";
import { DBParkingLot } from "@/entities/parking-lot/parking-lot.types";
import { ISlotRepository } from "@/entities/slot/slot.repository";
import { DBSlot } from "@/entities/slot/slot.types";
import { IUserRepository } from "@/entities/user/user.repository";
import { DBUser } from "@/entities/user/user.types";
import prisma from "@/lib/prisma";

export interface DashboardStats {
  totalRevenueToday: number;
  activeBookings: number;
  vehiclesParked: number;
  availableSlots: number;
  totalSlots: number;
}

export interface RecentBooking {
  id: string;
  status: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  vehicle: { id: string; licensePlate: string; model: string | null };
  slot: { id: string; slotCode: string; floorId: string };
}

export interface IAdminService {
  handleGetUsers(): Promise<DBUser[]>;
  handleGetDashboardStats(): Promise<DashboardStats>;
  handleGetRecentBookings(limit?: number): Promise<RecentBooking[]>;
  handleCreateFloor(data: { name: string }): Promise<DBFloor>;
  handleDeleteFloor(floorId: string): Promise<void>;
  handleCreateSlot(data: {
    floorId: string;
    slotCode: string;
    slotType:
      | "standard"
      | "compact"
      | "handicapped"
      | "ev_charging"
      | undefined;
    status: "available" | "reserved" | "occupied" | "inactive" | undefined;
  }): Promise<DBSlot>;
  handleDeleteSlot(slotId: string): Promise<void>;
  handleCreateParkingLot(data: {
    name: string;
    address: string;
  }): Promise<DBParkingLot>;
  handleDeleteParkingLot(parkingLotId: string): Promise<void>;
}

class AdminService implements IAdminService {
  public constructor(
    private userRepository: IUserRepository,
    private floorRepository: IFloorRepository,
    private slotRepository: ISlotRepository,
    private parkingLotRepository: IParkingLotRepository,
  ) {}

  public async handleGetUsers() {
    return this.userRepository.getAllUsers();
  }

  public async handleGetDashboardStats(): Promise<DashboardStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Total revenue from completed payments today
    const revenueResult = await prisma.payment.aggregate({
      where: {
        status: "completed",
        paidAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    });

    // Active bookings (status = active or confirmed)
    const activeBookings = await prisma.booking.count({
      where: { status: { in: ["active", "confirmed"] } },
    });

    // Vehicles currently parked (slots with occupied status)
    const vehiclesParked = await prisma.slot.count({
      where: { status: "occupied" },
    });

    // Available vs total slots
    const totalSlots = await prisma.slot.count();
    const availableSlots = await prisma.slot.count({
      where: { status: "available" },
    });

    return {
      totalRevenueToday: revenueResult._sum.amount ?? 0,
      activeBookings,
      vehiclesParked,
      availableSlots,
      totalSlots,
    };
  }

  public async handleGetRecentBookings(limit = 10): Promise<RecentBooking[]> {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        status: true,
        startTime: true,
        endTime: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        vehicle: { select: { id: true, licensePlate: true, model: true } },
        slot: { select: { id: true, slotCode: true, floorId: true } },
      },
    });
    return bookings;
  }

  public async handleCreateFloor(data: { name: string }) {
    return this.floorRepository.createFloor(data);
  }

  public async handleDeleteFloor(floorId: string) {
    return this.floorRepository.deleteFloor(floorId);
  }

  public async handleCreateSlot(data: {
    slotCode: string;
    slotType:
      | "standard"
      | "compact"
      | "handicapped"
      | "ev_charging"
      | undefined;
    status: "available" | "reserved" | "occupied" | "inactive" | undefined;
    floorId: string;
  }) {
    const { slotCode, slotType, status, floorId } = data;

    return this.slotRepository.createSlot({
      slotCode,
      slotType,
      status,
      floorId,
    });
  }

  public async handleDeleteSlot(slotId: string) {
    return this.slotRepository.deleteSlot(slotId);
  }

  public async handleCreateParkingLot(data: { name: string; address: string }) {
    const { name, address } = data;

    return this.parkingLotRepository.createParkingLot({
      name,
      address,
    });
  }

  public async handleDeleteParkingLot(parkingLotId: string) {
    return this.parkingLotRepository.deleteParkingLot(parkingLotId);
  }
}

export default AdminService;
