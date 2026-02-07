import db from "./index";
import { Project } from "../routes/projects.routes";
import { logger } from "../utils/logger";

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

function projectToRow(project: Project): {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  tags: string;
  liveUrl: string;
  githubUrl: string;
  metrics: string;
} {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    fullDescription: project.fullDescription,
    image: project.image,
    tags: JSON.stringify(project.tags),
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    metrics: JSON.stringify(project.metrics),
  };
}

export function getAllProjects(): Project[] {
  try {
    const rows = db
      .prepare("SELECT * FROM projects ORDER BY id")
      .all() as Record<string, unknown>[];
    return rows.map(rowToProject);
  } catch (error) {
    logger.error("Failed to fetch projects", error);
    throw error;
  }
}

export function findProjectById(id: string): Project | undefined {
  try {
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    return row ? rowToProject(row) : undefined;
  } catch (error) {
    logger.error("Failed to find project by id", { id, error });
    throw error;
  }
}

export function insertProject(project: Project): Project {
  const row = projectToRow(project);
  const stmt = db.prepare(
    "INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  try {
    stmt.run(
      row.id,
      row.title,
      row.description,
      row.fullDescription,
      row.image,
      row.tags,
      row.liveUrl,
      row.githubUrl,
      row.metrics,
    );
    const inserted = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(row.id) as Record<string, unknown>;
    return rowToProject(inserted);
  } catch (error) {
    logger.error("Failed to insert project", { id: project.id, error });
    throw error;
  }
}

export function updateProject(project: Project): Project {
  const row = projectToRow(project);
  const stmt = db.prepare(
    "UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?",
  );
  try {
    stmt.run(
      row.title,
      row.description,
      row.fullDescription,
      row.image,
      row.tags,
      row.liveUrl,
      row.githubUrl,
      row.metrics,
      row.id,
    );
    const updated = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(row.id) as Record<string, unknown>;
    return rowToProject(updated);
  } catch (error) {
    logger.error("Failed to update project", { id: project.id, error });
    throw error;
  }
}

export function deleteProject(id: string): void {
  try {
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  } catch (error) {
    logger.error("Failed to delete project", { id, error });
    throw error;
  }
}
