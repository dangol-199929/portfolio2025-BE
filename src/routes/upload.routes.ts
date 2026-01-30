import { Router } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import * as ctrl from "../controllers/upload.controller";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `project-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), ctrl.postUpload);
