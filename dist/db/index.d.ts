import Database from "better-sqlite3";
export declare function ensureDbDir(): void;
export declare function initSchema(dbInstance: InstanceType<typeof Database>): void;
declare const db: InstanceType<typeof Database>;
export default db;
//# sourceMappingURL=index.d.ts.map