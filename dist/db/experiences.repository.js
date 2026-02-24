"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExperiences = getAllExperiences;
exports.countExperiences = countExperiences;
exports.insertExperience = insertExperience;
exports.findExperienceById = findExperienceById;
exports.updateExperience = updateExperience;
exports.deleteExperience = deleteExperience;
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const index_1 = require("./index");
function sqlite() {
    return (0, index_1.getSqliteDb)();
}
async function getAllExperiences() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const prisma = (0, prisma_1.getPrisma)();
            const rows = await prisma.experience.findMany({ orderBy: { id: "asc" } });
            return rows.map((r) => ({
                id: r.id,
                title: r.title,
                company: r.company,
                period: r.period,
                description: r.description,
                side: r.side,
            }));
        }
        return sqlite()
            .prepare("SELECT * FROM experiences ORDER BY id")
            .all();
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch experiences", error);
        throw error;
    }
}
async function countExperiences() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            return await (0, prisma_1.getPrisma)().experience.count();
        }
        const row = sqlite().prepare("SELECT COUNT(*) as c FROM experiences").get();
        return row.c;
    }
    catch (error) {
        logger_1.logger.error("Failed to count experiences", error);
        throw error;
    }
}
async function insertExperience(experience) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const created = await (0, prisma_1.getPrisma)().experience.create({
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
                side: created.side,
            };
        }
        const stmt = sqlite().prepare("INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(experience.id, experience.title, experience.company, experience.period, experience.description, experience.side);
        return sqlite()
            .prepare("SELECT * FROM experiences WHERE id = ?")
            .get(experience.id);
    }
    catch (error) {
        logger_1.logger.error("Failed to insert experience", error);
        throw error;
    }
}
async function findExperienceById(id) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const r = await (0, prisma_1.getPrisma)().experience.findUnique({ where: { id } });
            if (!r)
                return undefined;
            return {
                id: r.id,
                title: r.title,
                company: r.company,
                period: r.period,
                description: r.description,
                side: r.side,
            };
        }
        return sqlite().prepare("SELECT * FROM experiences WHERE id = ?").get(id);
    }
    catch (error) {
        logger_1.logger.error("Failed to find experience by id", { id, error });
        throw error;
    }
}
async function updateExperience(experience) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const updated = await (0, prisma_1.getPrisma)().experience.update({
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
                side: updated.side,
            };
        }
        const stmt = sqlite().prepare("UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?");
        stmt.run(experience.title, experience.company, experience.period, experience.description, experience.side, experience.id);
        return sqlite()
            .prepare("SELECT * FROM experiences WHERE id = ?")
            .get(experience.id);
    }
    catch (error) {
        logger_1.logger.error("Failed to update experience", { id: experience.id, error });
        throw error;
    }
}
async function deleteExperience(id) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            await (0, prisma_1.getPrisma)().experience.delete({ where: { id } });
            return;
        }
        sqlite().prepare("DELETE FROM experiences WHERE id = ?").run(id);
    }
    catch (error) {
        logger_1.logger.error("Failed to delete experience", { id, error });
        throw error;
    }
}
//# sourceMappingURL=experiences.repository.js.map