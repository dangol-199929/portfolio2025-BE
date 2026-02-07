"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const experiences_routes_1 = require("./routes/experiences.routes");
const projects_routes_1 = require("./routes/projects.routes");
const resume_routes_1 = require("./routes/resume.routes");
const upload_routes_1 = require("./routes/upload.routes");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/resume", express_1.default.static(path_1.default.join(process.cwd(), "resume")));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api", experiences_routes_1.experiencesRouter);
app.use("/api", projects_routes_1.projectsRouter);
app.use("/api", resume_routes_1.resumeRouter);
app.use("/api", upload_routes_1.uploadRouter);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map