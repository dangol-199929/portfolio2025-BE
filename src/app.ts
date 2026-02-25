import express from "express";
import cors from "cors";
import { experiencesRouter } from "./routes/experiences.routes";
import { projectsRouter } from "./routes/projects.routes";
import { resumeRouter } from "./routes/resume.routes";
import { uploadRouter } from "./routes/upload.routes";
import { getResumeFile, getUploadedFile } from "./controllers/files.controller";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowAllCors = process.env.CORS_ALLOW_ALL === "1";
const corsAllowlist = (process.env.CORS_ORIGIN_ALLOWLIST ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

if (isProduction && !allowAllCors && corsAllowlist.length === 0) {
  throw new Error(
    "CORS_ORIGIN_ALLOWLIST is required in production unless CORS_ALLOW_ALL=1 is set.",
  );
}

app.use(express.json());
app.use(
  cors({
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
