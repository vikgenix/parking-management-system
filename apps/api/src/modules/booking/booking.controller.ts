import { Request, Response, NextFunction } from "express";
import {
  OK,
  CREATED,
  BAD_REQUEST,
} from "@/constants/httpStatusCodes";
import { IBookingService } from "./booking.service";
import AppError from "@/utils/AppError";

class BookingController {
  constructor(private bookingService: IBookingService) {}

  public getAvailableSlots = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const slots = await this.bookingService.handleGetAvailableSlots();
      res.status(OK).json({ slots });
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(BAD_REQUEST, "User missing");

      const { vehicleId, slotId, startTime, endTime } = req.body;
      if (!vehicleId || !slotId || !startTime || !endTime) {
        throw new AppError(BAD_REQUEST, "Missing required booking details");
      }

      const result = await this.bookingService.handleCreateBooking(
        userId,
        vehicleId,
        slotId,
        startTime,
        endTime
      );
      res.status(CREATED).json(result);
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(BAD_REQUEST, error.message || "Failed to create booking"));
      } else {
        next(new AppError(BAD_REQUEST, "Failed to create booking"));
      }
    }
  };

  public getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(BAD_REQUEST, "User missing");

      const bookings = await this.bookingService.handleGetMyBookings(userId);
      res.status(OK).json({ bookings });
    } catch (error) {
      next(error);
    }
  };

  public payBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      if (!userId) throw new AppError(BAD_REQUEST, "User missing");

      const result = await this.bookingService.handlePayBooking(userId, id);
      res.status(OK).json(result);
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(BAD_REQUEST, error.message || "Failed to pay booking"));
      } else {
        next(new AppError(BAD_REQUEST, "Failed to pay booking"));
      }
    }
  };
}

export default BookingController;
