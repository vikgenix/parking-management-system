import { Router } from "express";

import authRouter from "@/modules/auth/auth.router";
import adminRouter from "@/modules/admin/admin.router";
import vehicleRouter from "@/modules/vehicle/vehicle.router";
import bookingRouter from "@/modules/booking/booking.router";

const router = Router()
  .use("/auth", authRouter)
  .use("/admin", adminRouter)
  .use("/vehicle", vehicleRouter)
  .use("/booking", bookingRouter);

export default router;
