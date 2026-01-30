import { Request, Response, NextFunction } from "express";
import db from "../db";
import { Project } from "../routes/projects.routes";

const defaults = {
  liveUrl: "#",
  githubUrl: "#",
  tags: [] as string[],
  metrics: [] as string[],
  title: "",
  description: "",
  fullDescription: "",
  image: "",
};

function applyDefaults(body: Partial<Project>): Omit<Project, "id"> {
  return {
    title: body.title ?? defaults.title,
    description: body.description ?? defaults.description,
    fullDescription: body.fullDescription ?? defaults.fullDescription,
    image: body.image ?? defaults.image,
    tags: Array.isArray(body.tags) ? body.tags : defaults.tags,
    liveUrl: body.liveUrl ?? defaults.liveUrl,
    githubUrl: body.githubUrl ?? defaults.githubUrl,
    metrics: Array.isArray(body.metrics) ? body.metrics : defaults.metrics,
  };
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    fullDescription: row.fullDescription as string,
    image: row.image as string,
    tags: JSON.parse((row.tags as string) || "[]") as string[],
    liveUrl: row.liveUrl as string,
    githubUrl: row.githubUrl as string,
    metrics: JSON.parse((row.metrics as string) || "[]") as string[],
  };
}

export function getAll(_req: Request, res: Response, next: NextFunction): void {
  try {
    const rows = db
      .prepare("SELECT * FROM projects ORDER BY id")
      .all() as Record<string, unknown>[];
    res.status(200).json(rows.map(rowToProject));
  } catch {
    res.status(200).json([]);
  }
}

export function createOne(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const body = applyDefaults(req.body as Partial<Project>);
  const id = Date.now().toString();
  const tagsJson = JSON.stringify(body.tags);
  const metricsJson = JSON.stringify(body.metrics);
  const stmt = db.prepare(
    "INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  try {
    stmt.run(
      id,
      body.title,
      body.description,
      body.fullDescription,
      body.image,
      tagsJson,
      body.liveUrl,
      body.githubUrl,
      metricsJson,
    );
    const row = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id) as Record<string, unknown>;
    res.status(201).json(rowToProject(row));
  } catch {
    const err = new Error("Failed to create project") as Error & {
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
  const body = req.body as Project;
  const { id } = body;
  if (!id) {
    const err = new Error("id is required") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 400;
    err.expose = true;
    return next(err);
  }
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    const err = new Error("Project not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  const current = rowToProject(existing);
  const merged: Project = {
    id,
    title: body.title ?? current.title,
    description: body.description ?? current.description,
    fullDescription: body.fullDescription ?? current.fullDescription,
    image: body.image ?? current.image,
    tags: Array.isArray(body.tags) ? body.tags : current.tags,
    liveUrl: body.liveUrl ?? current.liveUrl,
    githubUrl: body.githubUrl ?? current.githubUrl,
    metrics: Array.isArray(body.metrics) ? body.metrics : current.metrics,
  };
  const tagsJson = JSON.stringify(merged.tags);
  const metricsJson = JSON.stringify(merged.metrics);
  const stmt = db.prepare(
    "UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?",
  );
  try {
    stmt.run(
      merged.title,
      merged.description,
      merged.fullDescription,
      merged.image,
      tagsJson,
      merged.liveUrl,
      merged.githubUrl,
      metricsJson,
      id,
    );
    res.status(200).json(merged);
  } catch {
    const err = new Error("Failed to update project") as Error & {
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
  const existing = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
  if (!existing) {
    const err = new Error("Project not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  try {
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } catch {
    const err = new Error("Failed to delete project") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 500;
    err.expose = true;
    next(err);
  }
}
