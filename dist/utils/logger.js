"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
function log(level, message, meta) {
    // Simple console-based logger; can be swapped for Pino in AWS.
    if (meta !== undefined) {
        // eslint-disable-next-line no-console
        console[level](`[${level.toUpperCase()}] ${message}`, meta);
    }
    else {
        // eslint-disable-next-line no-console
        console[level](`[${level.toUpperCase()}] ${message}`);
    }
}
exports.logger = {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
};
//# sourceMappingURL=logger.js.map