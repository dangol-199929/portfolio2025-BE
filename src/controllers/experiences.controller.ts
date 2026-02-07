import { Request, Response, NextFunction } from "express";
import { Experience } from "../routes/experiences.routes";
import {
  countExperiences,
  deleteExperience,
  findExperienceById,
  getAllExperiences,
  insertExperience,
  updateExperience,
} from "../db/experiences.repository";

export function getAll(_req: Request, res: Response, next: NextFunction): void {
  try {
    const experiences = getAllExperiences();
    res.status(200).json(experiences);
  } catch {
    res.status(200).json([]);
  }
}

export function createOne(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const body = req.body as Omit<Experience, "id">;
  const id = Date.now().toString();
  let side = body.side;
  if (side !== "left" && side !== "right") {
    const count = countExperiences();
    side = count % 2 === 0 ? "right" : "left";
  }
  try {
    const row = insertExperience({
      id,
      title: body.title ?? "",
      company: body.company ?? "",
      period: body.period ?? "",
      description: body.description ?? "",
      side,
    });
    res.status(201).json(row);
  } catch {
    const err = new Error("Failed to create experience") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}

export function updateOne(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const body = req.body as Experience;
  const { id, title, company, period, description, side } = body;
  if (!id) {
    const err = new Error("id is required") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  const existing = findExperienceById(id);
  if (!existing) {
    const err = new Error("Experience not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  try {
    const row = updateExperience({
      id,
      title: title ?? "",
      company: company ?? "",
      period: period ?? "",
      description: description ?? "",
      side: side ?? "right",
    });
    res.status(200).json(row);
  } catch {
    const err = new Error("Failed to update experience") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}

export function deleteOne(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = req.query.id as string | undefined;
  if (!id) {
    const err = new Error("ID is required") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  const existing = findExperienceById(id);
  if (!existing) {
    const err = new Error("Experience not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  try {
    deleteExperience(id);
    res.status(200).json({ success: true });
  } catch {
    const err = new Error("Failed to delete experience") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}
