import prisma from "@/lib/prisma";
import { Booking, Payment, Slot } from "@/generated/prisma/client";

export interface IBookingService {
  handleGetAvailableSlots(): Promise<Slot[]>;
  handleCreateBooking(
    userId: string,
    vehicleId: string,
    slotId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ booking: Booking; payment: Payment }>;
  handleGetMyBookings(userId: string): Promise<Booking[]>;
  handlePayBooking(userId: string, bookingId: string): Promise<{ success: boolean }>;
}

class BookingService implements IBookingService {
  public async handleGetAvailableSlots() {
    return prisma.slot.findMany({
      where: { status: "available" },
      include: {
        floor: {
          select: {
            name: true,
            level: true,
            parkingLot: { select: { name: true } },
          },
        },
      },
    });
  }

  public async handleCreateBooking(
    userId: string,
    vehicleId: string,
    slotId: string,
    startTime: Date,
    endTime: Date
  ) {
    // Basic verification that slot is available
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot || slot.status !== "available") {
      throw new Error("Slot is not available.");
    }

    // Check if vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
    if (!vehicle) {
      throw new Error("Vehicle not found or does not belong to user.");
    }

    // Create booking and update slot status transactionally
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          vehicleId,
          slotId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: "pending", // Initially pending until paid
        },
      });

      await tx.slot.update({
        where: { id: slotId },
        data: { status: "reserved" },
      });

      // Generate a mock payment of $10.00
      const payment = await tx.payment.create({
        data: {
          amount: 10.00,
          status: "pending",
          userId,
          bookingId: booking.id,
        },
      });

      return { booking, payment };
    });

    return result;
  }

  public async handleGetMyBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        slot: {
          include: { floor: { include: { parkingLot: true } } }
        },
        payments: true
      },
    });
  }

  public async handlePayBooking(userId: string, bookingId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { payments: true },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") throw new Error("Booking is not pending payment");

    const pendingPayment = booking.payments.find(p => p.status === "pending");
    if (!pendingPayment) throw new Error("No pending payment found for booking");

    // Process payment (mock)
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: pendingPayment.id },
        data: { status: "completed", paidAt: new Date() },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" }, // Confirm the booking
      });
    });

    return { success: true };
  }
}

export default BookingService;
