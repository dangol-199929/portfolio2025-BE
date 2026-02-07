export type LogLevel = "info" | "warn" | "error";
export interface Logger {
    info: (message: string, meta?: unknown) => void;
    warn: (message: string, meta?: unknown) => void;
    error: (message: string, meta?: unknown) => void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map