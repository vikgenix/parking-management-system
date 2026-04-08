import { Router } from "express";

import authRouter from "@/modules/auth/auth.router";

const router = Router().use("/api/auth", authRouter);

export default router;
