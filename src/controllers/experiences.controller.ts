import { Request, Response, NextFunction } from "express";
import db from "../db";
import { Experience } from "../routes/experiences.routes";

export function getAll(_req: Request, res: Response, next: NextFunction): void {
  try {
    const rows = db
      .prepare("SELECT * FROM experiences ORDER BY id")
      .all() as Experience[];
    res.status(200).json(rows);
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
    const count = (
      db.prepare("SELECT COUNT(*) as c FROM experiences").get() as { c: number }
    ).c;
    side = count % 2 === 0 ? "right" : "left";
  }
  const stmt = db.prepare(
    "INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)",
  );
  try {
    stmt.run(
      id,
      body.title ?? "",
      body.company ?? "",
      body.period ?? "",
      body.description ?? "",
      side,
    );
    const row = db
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(id) as Experience;
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
  const existing = db
    .prepare("SELECT id FROM experiences WHERE id = ?")
    .get(id);
  if (!existing) {
    const err = new Error("Experience not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  const stmt = db.prepare(
    "UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?",
  );
  try {
    stmt.run(
      title ?? "",
      company ?? "",
      period ?? "",
      description ?? "",
      side ?? "right",
      id,
    );
    const row = db
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(id) as Experience;
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
  const existing = db
    .prepare("SELECT id FROM experiences WHERE id = ?")
    .get(id);
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
    db.prepare("DELETE FROM experiences WHERE id = ?").run(id);
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
