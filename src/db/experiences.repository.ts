import { Experience } from "../routes/experiences.routes";
import { getPrisma, usePrisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { getSqliteDb } from "./index";

function sqlite() {
  return getSqliteDb();
}

export async function getAllExperiences(): Promise<Experience[]> {
  try {
    if (usePrisma()) {
      const prisma = getPrisma();
      const rows = await prisma.experience.findMany({ orderBy: { id: "asc" } });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        company: r.company,
        period: r.period,
        description: r.description,
        side: r.side as "left" | "right",
      }));
    }

    return sqlite()
      .prepare("SELECT * FROM experiences ORDER BY id")
      .all() as Experience[];
  } catch (error) {
    logger.error("Failed to fetch experiences", error);
    throw error;
  }
}

export async function countExperiences(): Promise<number> {
  try {
    if (usePrisma()) {
      return await getPrisma().experience.count();
    }

    const row = sqlite().prepare("SELECT COUNT(*) as c FROM experiences").get() as {
      c: number;
    };
    return row.c;
  } catch (error) {
    logger.error("Failed to count experiences", error);
    throw error;
  }
}

export async function insertExperience(
  experience: Experience,
): Promise<Experience> {
  try {
    if (usePrisma()) {
      const created = await getPrisma().experience.create({
        data: {
          id: experience.id,
          title: experience.title,
          company: experience.company,
          period: experience.period,
          description: experience.description,
          side: experience.side,
        },
      });
      return {
        id: created.id,
        title: created.title,
        company: created.company,
        period: created.period,
        description: created.description,
        side: created.side as "left" | "right",
      };
    }

    const stmt = sqlite().prepare(
      "INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      experience.id,
      experience.title,
      experience.company,
      experience.period,
      experience.description,
      experience.side,
    );

    return sqlite()
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(experience.id) as Experience;
  } catch (error) {
    logger.error("Failed to insert experience", error);
    throw error;
  }
}

export async function findExperienceById(
  id: string,
): Promise<Experience | undefined> {
  try {
    if (usePrisma()) {
      const r = await getPrisma().experience.findUnique({ where: { id } });
      if (!r) return undefined;
      return {
        id: r.id,
        title: r.title,
        company: r.company,
        period: r.period,
        description: r.description,
        side: r.side as "left" | "right",
      };
    }

    return sqlite().prepare("SELECT * FROM experiences WHERE id = ?").get(id) as
      | Experience
      | undefined;
  } catch (error) {
    logger.error("Failed to find experience by id", { id, error });
    throw error;
  }
}

export async function updateExperience(
  experience: Experience,
): Promise<Experience> {
  try {
    if (usePrisma()) {
      const updated = await getPrisma().experience.update({
        where: { id: experience.id },
        data: {
          title: experience.title,
          company: experience.company,
          period: experience.period,
          description: experience.description,
          side: experience.side,
        },
      });
      return {
        id: updated.id,
        title: updated.title,
        company: updated.company,
        period: updated.period,
        description: updated.description,
        side: updated.side as "left" | "right",
      };
    }

    const stmt = sqlite().prepare(
      "UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?",
    );
    stmt.run(
      experience.title,
      experience.company,
      experience.period,
      experience.description,
      experience.side,
      experience.id,
    );

    return sqlite()
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(experience.id) as Experience;
  } catch (error) {
    logger.error("Failed to update experience", { id: experience.id, error });
    throw error;
  }
}

export async function deleteExperience(id: string): Promise<void> {
  try {
    if (usePrisma()) {
      await getPrisma().experience.delete({ where: { id } });
      return;
    }

    sqlite().prepare("DELETE FROM experiences WHERE id = ?").run(id);
  } catch (error) {
    logger.error("Failed to delete experience", { id, error });
    throw error;
  }
}
