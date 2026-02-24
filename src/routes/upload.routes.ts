import { Router } from "express";
import multer from "multer";
import * as ctrl from "../controllers/upload.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), ctrl.postUpload);
