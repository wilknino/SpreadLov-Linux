import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Ensure the database is provisioned and .env is set.");
}

const config: Config = {
  schema: "./shared/schema.ts",     // your schema file
  out: "./migrations",              // migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
};

export default config;
