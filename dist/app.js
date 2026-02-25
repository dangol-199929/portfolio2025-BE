"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const experiences_routes_1 = require("./routes/experiences.routes");
const projects_routes_1 = require("./routes/projects.routes");
const resume_routes_1 = require("./routes/resume.routes");
const upload_routes_1 = require("./routes/upload.routes");
const files_controller_1 = require("./controllers/files.controller");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const isProduction = process.env.NODE_ENV === "production";
const allowAllCors = process.env.CORS_ALLOW_ALL === "1";
const corsAllowlist = (process.env.CORS_ORIGIN_ALLOWLIST ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
if (isProduction && !allowAllCors && corsAllowlist.length === 0) {
    throw new Error("CORS_ORIGIN_ALLOWLIST is required in production unless CORS_ALLOW_ALL=1 is set.");
}
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            // Allow curl/postman/server-to-server requests without Origin header.
            callback(null, true);
            return;
        }
        if (allowAllCors) {
            callback(null, true);
            return;
        }
        if (corsAllowlist.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS"));
    },
}));
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.get("/uploads/:fileName", files_controller_1.getUploadedFile);
app.get("/resume/:fileName", files_controller_1.getResumeFile);
app.use("/api", experiences_routes_1.experiencesRouter);
app.use("/api", projects_routes_1.projectsRouter);
app.use("/api", resume_routes_1.resumeRouter);
app.use("/api", upload_routes_1.uploadRouter);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map