import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import {
  getPublicPath,
  isS3Configured,
  uploadObject,
} from "../lib/objectStorage";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function buildImageName(originalName: string): string {
  const ext = path.extname(originalName) || ".png";
  return `project-${Date.now()}${ext.toLowerCase()}`;
}

export async function postUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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
    const err = new Error("Only image files are allowed") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }

  const fileName = buildImageName(file.originalname);

  const relativePath = `/uploads/${fileName}`;
  try {
    if (isS3Configured()) {
      await uploadObject({
        key: `uploads/${fileName}`,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } else {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, fileName), file.buffer);
    }

    const pathForClient = isS3Configured()
      ? getPublicPath(`uploads/${fileName}`)
      : relativePath;
    res.status(200).json({ path: pathForClient, success: true });
  } catch {
    const err = new Error("Failed to upload image") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}
