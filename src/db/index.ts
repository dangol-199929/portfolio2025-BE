import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "portfolio.db");
const schemaPath = path.join(__dirname, "schema.sql");

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

ensureDbDir();
const db: InstanceType<typeof Database> = new Database(dbPath);
initSchema(db);

export default db;
