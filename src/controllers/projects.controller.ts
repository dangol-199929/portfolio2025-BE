import { Request, Response, NextFunction } from "express";
import { Project } from "../routes/projects.routes";
import {
  deleteProject,
  findProjectById,
  getAllProjects,
  insertProject,
  updateProject,
} from "../db/projects.repository";

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
    const projects = getAllProjects();
    res.status(200).json(projects);
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
  try {
    const row = insertProject({
      id,
      title: body.title,
      description: body.description,
      fullDescription: body.fullDescription,
      image: body.image,
      tags: body.tags,
      liveUrl: body.liveUrl,
      githubUrl: body.githubUrl,
      metrics: body.metrics,
    });
    res.status(201).json(row);
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
  const existing = findProjectById(id);
  if (!existing) {
    const err = new Error("Project not found") as Error & {
      statusCode?: number;
      expose?: boolean;
    };
    err.statusCode = 404;
    err.expose = true;
    return next(err);
  }
  const current = existing;
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
  try {
    const updated = updateProject(merged);
    res.status(200).json(updated);
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
  const existing = findProjectById(id);
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
    deleteProject(id);
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
