import { PrismaClient } from "../generated/prisma";

const isProduction = process.env.NODE_ENV === "production";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url.trim();
  if (isProduction) {
    throw new Error(
      "DATABASE_URL is required in production. Provide it via AWS Secrets Manager.",
    );
  }
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ?? "5432";
  const user = process.env.DB_USER ?? process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const db = process.env.DB_NAME ?? "portfolio";
  if (host && user && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}?schema=public`;
  }
  return "";
}

let prismaInstance: PrismaClient | null = null;

export function usePrisma(): boolean {
  if (isProduction) return true;
  return getConnectionString().length > 0;
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error("DATABASE_URL or DB_* env vars required for Prisma");
    }
    process.env.DATABASE_URL = connectionString;
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}
