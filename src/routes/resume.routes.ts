import { Router } from "express";
import multer from "multer";
import * as ctrl from "../controllers/resume.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const resumeRouter = Router();

resumeRouter.get("/resume", ctrl.getResume);
resumeRouter.post("/resume", upload.single("file"), ctrl.postResume);
