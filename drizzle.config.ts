import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./src/db/drizzleOut",
  dbCredentials: {
    url: process.env.DATABASE_URL || "default_database_url",
  },
});