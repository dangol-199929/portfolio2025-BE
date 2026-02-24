import express from "express";
import cors from "cors";
import { experiencesRouter } from "./routes/experiences.routes";
import { projectsRouter } from "./routes/projects.routes";
import { resumeRouter } from "./routes/resume.routes";
import { uploadRouter } from "./routes/upload.routes";
import { getResumeFile, getUploadedFile } from "./controllers/files.controller";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
const corsAllowlist = (process.env.CORS_ORIGIN_ALLOWLIST ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: true,
    // origin: corsAllowlist.length > 0 ? corsAllowlist : true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/uploads/:fileName", getUploadedFile);
app.get("/resume/:fileName", getResumeFile);

app.use("/api", experiencesRouter);
app.use("/api", projectsRouter);
app.use("/api", resumeRouter);
app.use("/api", uploadRouter);

app.use(errorHandler);

export default app;
