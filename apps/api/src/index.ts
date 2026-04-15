import { App } from "@/server";
import env from "@/constants/env";
import { verifyDBConnection } from "@/lib/prisma";
import router from "@/modules";

async function main() {
  await verifyDBConnection();

  const app = new App(
    [
      {
        path: "/api",
        router,
      },
    ],
    env,
  );
  app.startServer();
}

main();
