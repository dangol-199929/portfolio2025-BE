import db from "./index";
import { Experience } from "../routes/experiences.routes";
import { logger } from "../utils/logger";

export function getAllExperiences(): Experience[] {
  try {
    const rows = db
      .prepare("SELECT * FROM experiences ORDER BY id")
      .all() as Experience[];
    return rows;
  } catch (error) {
    logger.error("Failed to fetch experiences", error);
    throw error;
  }
}

export function countExperiences(): number {
  try {
    const row = db.prepare("SELECT COUNT(*) as c FROM experiences").get() as {
      c: number;
    };
    return row.c;
  } catch (error) {
    logger.error("Failed to count experiences", error);
    throw error;
  }
}

export function insertExperience(experience: Experience): Experience {
  const stmt = db.prepare(
    "INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)",
  );
  try {
    stmt.run(
      experience.id,
      experience.title,
      experience.company,
      experience.period,
      experience.description,
      experience.side,
    );
    const row = db
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(experience.id) as Experience;
    return row;
  } catch (error) {
    logger.error("Failed to insert experience", error);
    throw error;
  }
}

export function findExperienceById(id: string): Experience | undefined {
  try {
    const row = db.prepare("SELECT * FROM experiences WHERE id = ?").get(id) as
      | Experience
      | undefined;
    return row;
  } catch (error) {
    logger.error("Failed to find experience by id", { id, error });
    throw error;
  }
}

export function updateExperience(experience: Experience): Experience {
  const stmt = db.prepare(
    "UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?",
  );
  try {
    stmt.run(
      experience.title,
      experience.company,
      experience.period,
      experience.description,
      experience.side,
      experience.id,
    );
    const row = db
      .prepare("SELECT * FROM experiences WHERE id = ?")
      .get(experience.id) as Experience;
    return row;
  } catch (error) {
    logger.error("Failed to update experience", { id: experience.id, error });
    throw error;
  }
}

export function deleteExperience(id: string): void {
  try {
    db.prepare("DELETE FROM experiences WHERE id = ?").run(id);
  } catch (error) {
    logger.error("Failed to delete experience", { id, error });
    throw error;
  }
}
