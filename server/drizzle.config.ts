import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas/index.ts", // your re-export file
  out: "./drizzle",
  dbCredentials: {
    // we already set this in server/.env
    url: process.env.DATABASE_URL!,
  },
});
