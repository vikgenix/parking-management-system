import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import env from "@/shared/constants/env";

class Database {
  private static instance: PrismaClient;
  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!this.instance) {
      const adapter = new PrismaPg({
        connectionString: env.get("DATABASE_URL"),
        connectionTimeoutMillis: 5000,
      });
      this.instance = new PrismaClient({ adapter });
    }
    return this.instance;
  }
}

const prisma = Database.getInstance();
export default prisma;

export async function verifyDBConnection(maxRetries: number = 10) {
  let retries = 0;

  while (true) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.info("Successfully connected to the database");
      break;
    } catch {
      retries++;
      console.warn(
        `Database connection failed. Retrying... (Attempt ${retries})`,
      );
      if (retries > maxRetries) {
        throw new Error(
          "Exceeded maximum retry attempts for database connection. Exiting.",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
