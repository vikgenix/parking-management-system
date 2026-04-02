import App from "@/app";
import { verifyDBConnection } from "@/shared/lib/db";

async function main() {
  await verifyDBConnection();
  const app = new App([]);
  app.startServer();
}

main();
