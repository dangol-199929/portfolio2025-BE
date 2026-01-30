import express from "express";
import cors from "cors";
import path from "path";
import { experiencesRouter } from "./routes/experiences.routes";
import { projectsRouter } from "./routes/projects.routes";
import { resumeRouter } from "./routes/resume.routes";
import { uploadRouter } from "./routes/upload.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/resume", express.static(path.join(process.cwd(), "resume")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", experiencesRouter);
app.use("/api", projectsRouter);
app.use("/api", resumeRouter);
app.use("/api", uploadRouter);

app.use(errorHandler);

export default app;
