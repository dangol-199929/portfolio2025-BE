import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { isS3Configured, uploadObject } from "../lib/objectStorage";
import { getResumePath, setResumePath } from "../db/settings.repository";
import { logger } from "../utils/logger";

const ALLOWED_MIME = "application/pdf";

function buildResumeFileName(): string {
  return `resume-${Date.now()}.pdf`;
}

export async function getResume(
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const resumePath = await getResumePath();
    res.status(200).json({ resumePath });
  } catch {
    res.status(200).json({ resumePath: "/resume/Resume.pdf" });
  }
}

export async function postResume(
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

  if (file.mimetype !== ALLOWED_MIME) {
    const err = new Error("Only PDF files are allowed") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }

  const fileName = buildResumeFileName();
  const resumePath = `/resume/${fileName}`;

  try {
    if (isS3Configured()) {
      await uploadObject({
        key: `resume/${fileName}`,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } else {
      const resumeDir = path.join(process.cwd(), "resume");
      if (!fs.existsSync(resumeDir)) {
        fs.mkdirSync(resumeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(resumeDir, fileName), file.buffer);
    }

    await setResumePath(resumePath);
    res.status(200).json({ resumePath, success: true });
  } catch (e) {
    const cause = e instanceof Error ? e : new Error(String(e));
    logger.error("Resume upload failed", {
      message: cause.message,
      stack: cause.stack,
    });
    const err = new Error(
      process.env.NODE_ENV === "production"
        ? "Failed to upload resume"
        : `Failed to upload resume: ${cause.message}`,
    ) as Error & { statusCode?: number; expose?: boolean };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}
