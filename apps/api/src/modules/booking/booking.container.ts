import env from "@/constants/env";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { AuthGuardService } from "@/middleware/services/auth-guard.service";
import { PrismaSessionRepository } from "@/entities/session/session.repository";
import { JoseTokenService } from "@/services/token.service";
import BookingController from "./booking.controller";
import BookingService from "./booking.service";

export function createBookingModule() {
  const sessionRepository = new PrismaSessionRepository();

  const tokenService = new JoseTokenService(
    env.get("REFRESH_TOKEN_SECRET"),
    env.get("ACCESS_TOKEN_SECRET"),
  );

  const bookingService = new BookingService();

  const authGuardService = new AuthGuardService(
    tokenService,
    sessionRepository,
  );

  const bookingController = new BookingController(bookingService);

  const authMiddleware = new AuthMiddleware(authGuardService, false);
  const authenticate = authMiddleware.authenticate;

  return {
    bookingController,
    authenticate,
  };
}
