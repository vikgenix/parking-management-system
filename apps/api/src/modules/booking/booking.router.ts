import { Router } from "express";
import rateLimit from "express-rate-limit";
import env from "@/constants/env";
import { createBookingModule } from "./booking.container";

const { bookingController, authenticate } = createBookingModule();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: env.get("NODE_ENV") === "production" ? 200 : 10000,
  message: {
    error: "Too many requests, please try again later.",
  },
  skipSuccessfulRequests: true,
});

const bookingRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/available-slots", bookingController.getAvailableSlots)
  .get("/my-bookings", bookingController.getMyBookings)
  .post("/", bookingController.createBooking)
  .post("/:id/pay", bookingController.payBooking);

export default bookingRouter;
