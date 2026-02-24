import { Project } from "../routes/projects.routes";
import { getPrisma, usePrisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { getSqliteDb } from "./index";

function sqlite() {
  return getSqliteDb();
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

export async function getAllProjects(): Promise<Project[]> {
  try {
    if (usePrisma()) {
      const rows = await getPrisma().project.findMany({
        orderBy: { id: "asc" },
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        fullDescription: r.fullDescription,
        image: r.image,
        tags: JSON.parse(r.tags || "[]") as string[],
        liveUrl: r.liveUrl,
        githubUrl: r.githubUrl,
        metrics: JSON.parse(r.metrics || "[]") as string[],
      }));
    }

    const rows = sqlite()
      .prepare("SELECT * FROM projects ORDER BY id")
      .all() as Record<string, unknown>[];
    return rows.map(rowToProject);
  } catch (error) {
    logger.error("Failed to fetch projects", error);
    throw error;
  }
}

export async function findProjectById(
  id: string,
): Promise<Project | undefined> {
  try {
    if (usePrisma()) {
      const r = await getPrisma().project.findUnique({ where: { id } });
      if (!r) return undefined;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        fullDescription: r.fullDescription,
        image: r.image,
        tags: JSON.parse(r.tags || "[]") as string[],
        liveUrl: r.liveUrl,
        githubUrl: r.githubUrl,
        metrics: JSON.parse(r.metrics || "[]") as string[],
      };
    }

    const row = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;
    return row ? rowToProject(row) : undefined;
  } catch (error) {
    logger.error("Failed to find project by id", { id, error });
    throw error;
  }
}

export async function insertProject(project: Project): Promise<Project> {
  const row = projectToRow(project);
  try {
    if (usePrisma()) {
      const created = await getPrisma().project.create({
        data: {
          id: row.id,
          title: row.title,
          description: row.description,
          fullDescription: row.fullDescription,
          image: row.image,
          tags: row.tags,
          liveUrl: row.liveUrl,
          githubUrl: row.githubUrl,
          metrics: row.metrics,
        },
      });
      return {
        id: created.id,
        title: created.title,
        description: created.description,
        fullDescription: created.fullDescription,
        image: created.image,
        tags: JSON.parse(created.tags || "[]") as string[],
        liveUrl: created.liveUrl,
        githubUrl: created.githubUrl,
        metrics: JSON.parse(created.metrics || "[]") as string[],
      };
    }

    const stmt = sqlite().prepare(
      "INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
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

    const inserted = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(
      row.id,
    ) as Record<string, unknown>;
    return rowToProject(inserted);
  } catch (error) {
    logger.error("Failed to insert project", { id: project.id, error });
    throw error;
  }
}

export async function updateProject(project: Project): Promise<Project> {
  const row = projectToRow(project);
  try {
    if (usePrisma()) {
      const updated = await getPrisma().project.update({
        where: { id: row.id },
        data: {
          title: row.title,
          description: row.description,
          fullDescription: row.fullDescription,
          image: row.image,
          tags: row.tags,
          liveUrl: row.liveUrl,
          githubUrl: row.githubUrl,
          metrics: row.metrics,
        },
      });
      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        fullDescription: updated.fullDescription,
        image: updated.image,
        tags: JSON.parse(updated.tags || "[]") as string[],
        liveUrl: updated.liveUrl,
        githubUrl: updated.githubUrl,
        metrics: JSON.parse(updated.metrics || "[]") as string[],
      };
    }

    const stmt = sqlite().prepare(
      "UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?",
    );
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

    const updated = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(
      row.id,
    ) as Record<string, unknown>;
    return rowToProject(updated);
  } catch (error) {
    logger.error("Failed to update project", { id: project.id, error });
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    if (usePrisma()) {
      await getPrisma().project.delete({ where: { id } });
      return;
    }

    sqlite().prepare("DELETE FROM projects WHERE id = ?").run(id);
  } catch (error) {
    logger.error("Failed to delete project", { id, error });
    throw error;
  }
}
