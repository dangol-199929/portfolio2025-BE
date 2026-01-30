import { Request, Response, NextFunction } from "express";
import * as path from "path";
import * as fs from "fs";
import db from "../db";

const ALLOWED_MIME = "application/pdf";

export function getResume(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const row = db
      .prepare("SELECT resumePath FROM settings WHERE id = 1")
      .get() as { resumePath: string } | undefined;
    const resumePath = row?.resumePath ?? "/resume/Resume.pdf";
    res.status(200).json({ resumePath });
  } catch {
    res.status(200).json({ resumePath: "/resume/Resume.pdf" });
  }
}

export function postResume(
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
  if (file.mimetype !== ALLOWED_MIME) {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
    }
    const err = new Error("Only PDF files are allowed") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  const resumePath = `/resume/${path.basename(file.path)}`;
  try {
    db.prepare("UPDATE settings SET resumePath = ? WHERE id = 1").run(
      resumePath,
    );
    res.status(200).json({ resumePath, success: true });
  } catch {
    const err = new Error("Failed to upload resume") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}
