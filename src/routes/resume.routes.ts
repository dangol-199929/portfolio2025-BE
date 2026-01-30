import { Router } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import * as ctrl from "../controllers/resume.controller";

const resumeDir = path.join(process.cwd(), "resume");
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  filename: (_req, _file, cb) => cb(null, `resume-${Date.now()}.pdf`),
});
const upload = multer({ storage });

export const resumeRouter = Router();

resumeRouter.get("/resume", ctrl.getResume);
resumeRouter.post("/resume", upload.single("file"), ctrl.postResume);
