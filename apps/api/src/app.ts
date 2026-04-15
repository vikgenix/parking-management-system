import { App } from "@/server";
import env from "@/constants/env";
import { verifyDBConnection } from "@/lib/prisma";
import router from "@/modules";

const instance = new App([{ path: "/api", router }], env);

export default instance.getApp();

verifyDBConnection().catch(console.error);
