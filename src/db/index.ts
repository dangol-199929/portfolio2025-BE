import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { usePrisma } from "../lib/prisma";

const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "portfolio.db");
const isProduction = process.env.NODE_ENV === "production";
let sqliteDb: InstanceType<typeof Database> | null = null;

function resolveSchemaPath(): string {
  const distPath = path.join(__dirname, "schema.sql");
  if (fs.existsSync(distPath)) return distPath;
  return path.join(process.cwd(), "src", "db", "schema.sql");
}

const schemaPath = resolveSchemaPath();

export function ensureDbDir(): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function initSchema(dbInstance: InstanceType<typeof Database>): void {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  dbInstance.exec(schema);
}

export function getSqliteDb(): InstanceType<typeof Database> {
  if (isProduction) {
    throw new Error(
      "SQLite is disabled in production. Use PostgreSQL via DATABASE_URL.",
    );
  }
  if (usePrisma()) {
    throw new Error(
      "SQLite is disabled when Prisma/PostgreSQL is configured. Remove DATABASE_URL or DB_* for local SQLite development.",
    );
  }
  if (!sqliteDb) {
    ensureDbDir();
    sqliteDb = new Database(dbPath);
    initSchema(sqliteDb);
  }
  return sqliteDb;
}
