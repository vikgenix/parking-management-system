import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createAdminModule } from "@/modules/admin/admin.container";

const { adminController, adminAuthenticate } = createAdminModule();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: env.get("NODE_ENV") === "production" ? 200 : 10000,
  message: {
    error: "Too many requests, please try again later.",
  },
  skipSuccessfulRequests: true,
});

const adminRouter = Router()
  .use(limiter)
  .use(adminAuthenticate)
  .get("/user", adminController.getUsers)
  .get("/stats", adminController.getDashboardStats)
  .get("/bookings/recent", adminController.getRecentBookings)
  .post("/floor", adminController.createFloor)
  .delete("/floor/:id", adminController.deleteFloor)
  .post("/slot", adminController.createSlot)
  .delete("/slot/:id", adminController.deleteSlot)
  .post("/parking-lot", adminController.createParkingLot)
  .delete("/parking-lot/:id", adminController.deleteParkingLot);

export default adminRouter;
