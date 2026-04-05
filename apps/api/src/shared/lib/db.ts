import mongoose from "mongoose";
import env from "@/shared/constants/env";

export async function verifyDBConnection(maxRetries: number = 10) {
  let retries = 0;
  const mongoURI =
    env.get("DATABASE_URL") || "mongodb://localhost:27017/parking_management";

  while (true) {
    try {
      await mongoose.connect(mongoURI);
      console.info(
        "Successfully connected to the MongoDB database via Mongoose",
      );
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
