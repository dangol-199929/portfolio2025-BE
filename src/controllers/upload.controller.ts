import { Request, Response, NextFunction } from "express";
import * as path from "path";
import * as fs from "fs";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function postUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const file = req.file;
  if (!file) {
    const err = new Error("No file uploaded") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
    }
    const err = new Error("Only image files are allowed") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  const filePath = `/uploads/${path.basename(file.path)}`;
  res.status(200).json({ path: filePath, success: true });
}
