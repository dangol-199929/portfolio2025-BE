import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { getObject, isS3Configured } from "../lib/objectStorage";

function getParamValue(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function safeBaseName(input: string): string {
  return path.basename(input);
}

async function sendFromS3(
  key: string,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const data = await getObject(key);
  if (!data || !data.Body) {
    const err = new Error("File not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }

  const body = data.Body as { transformToByteArray?: () => Promise<Uint8Array> };
  if (!body.transformToByteArray) {
    const err = new Error("Unable to read file") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    return next(err);
  }

  const bytes = await body.transformToByteArray();
  if (data.ContentType) {
    res.setHeader("Content-Type", data.ContentType);
  }
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(Buffer.from(bytes));
}

function sendLocalFile(
  dir: "uploads" | "resume",
  fileName: string,
  res: Response,
  next: NextFunction,
): void {
  const filePath = path.join(process.cwd(), dir, fileName);
  if (!fs.existsSync(filePath)) {
    const err = new Error("File not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }

  res.sendFile(filePath, (error) => {
    if (error) {
      next(error);
    }
  });
}

export async function getUploadedFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const fileName = safeBaseName(getParamValue(req.params.fileName));
  if (!fileName) {
    const err = new Error("File name is required") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }

  if (isS3Configured()) {
    await sendFromS3(`uploads/${fileName}`, res, next);
    return;
  }

  sendLocalFile("uploads", fileName, res, next);
}

export async function getResumeFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const fileName = safeBaseName(getParamValue(req.params.fileName));
  if (!fileName) {
    const err = new Error("File name is required") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }

  if (isS3Configured()) {
    await sendFromS3(`resume/${fileName}`, res, next);
    return;
  }

  sendLocalFile("resume", fileName, res, next);
}
