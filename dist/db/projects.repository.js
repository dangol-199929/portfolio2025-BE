"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = getAllProjects;
exports.findProjectById = findProjectById;
exports.insertProject = insertProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const index_1 = require("./index");
function sqlite() {
    return (0, index_1.getSqliteDb)();
}
function rowToProject(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        fullDescription: row.fullDescription,
        image: row.image,
        tags: JSON.parse(row.tags || "[]"),
        liveUrl: row.liveUrl,
        githubUrl: row.githubUrl,
        metrics: JSON.parse(row.metrics || "[]"),
    };
}
function projectToRow(project) {
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
async function getAllProjects() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const rows = await (0, prisma_1.getPrisma)().project.findMany({
                orderBy: { id: "asc" },
            });
            return rows.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                fullDescription: r.fullDescription,
                image: r.image,
                tags: JSON.parse(r.tags || "[]"),
                liveUrl: r.liveUrl,
                githubUrl: r.githubUrl,
                metrics: JSON.parse(r.metrics || "[]"),
            }));
        }
        const rows = sqlite()
            .prepare("SELECT * FROM projects ORDER BY id")
            .all();
        return rows.map(rowToProject);
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch projects", error);
        throw error;
    }
}
async function findProjectById(id) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const r = await (0, prisma_1.getPrisma)().project.findUnique({ where: { id } });
            if (!r)
                return undefined;
            return {
                id: r.id,
                title: r.title,
                description: r.description,
                fullDescription: r.fullDescription,
                image: r.image,
                tags: JSON.parse(r.tags || "[]"),
                liveUrl: r.liveUrl,
                githubUrl: r.githubUrl,
                metrics: JSON.parse(r.metrics || "[]"),
            };
        }
        const row = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(id);
        return row ? rowToProject(row) : undefined;
    }
    catch (error) {
        logger_1.logger.error("Failed to find project by id", { id, error });
        throw error;
    }
}
async function insertProject(project) {
    const row = projectToRow(project);
    try {
        if ((0, prisma_1.usePrisma)()) {
            const created = await (0, prisma_1.getPrisma)().project.create({
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
                tags: JSON.parse(created.tags || "[]"),
                liveUrl: created.liveUrl,
                githubUrl: created.githubUrl,
                metrics: JSON.parse(created.metrics || "[]"),
            };
        }
        const stmt = sqlite().prepare("INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.run(row.id, row.title, row.description, row.fullDescription, row.image, row.tags, row.liveUrl, row.githubUrl, row.metrics);
        const inserted = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(row.id);
        return rowToProject(inserted);
    }
    catch (error) {
        logger_1.logger.error("Failed to insert project", { id: project.id, error });
        throw error;
    }
}
async function updateProject(project) {
    const row = projectToRow(project);
    try {
        if ((0, prisma_1.usePrisma)()) {
            const updated = await (0, prisma_1.getPrisma)().project.update({
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
                tags: JSON.parse(updated.tags || "[]"),
                liveUrl: updated.liveUrl,
                githubUrl: updated.githubUrl,
                metrics: JSON.parse(updated.metrics || "[]"),
            };
        }
        const stmt = sqlite().prepare("UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?");
        stmt.run(row.title, row.description, row.fullDescription, row.image, row.tags, row.liveUrl, row.githubUrl, row.metrics, row.id);
        const updated = sqlite().prepare("SELECT * FROM projects WHERE id = ?").get(row.id);
        return rowToProject(updated);
    }
    catch (error) {
        logger_1.logger.error("Failed to update project", { id: project.id, error });
        throw error;
    }
}
async function deleteProject(id) {
    try {
        if ((0, prisma_1.usePrisma)()) {
            await (0, prisma_1.getPrisma)().project.delete({ where: { id } });
            return;
        }
        sqlite().prepare("DELETE FROM projects WHERE id = ?").run(id);
    }
    catch (error) {
        logger_1.logger.error("Failed to delete project", { id, error });
        throw error;
    }
}
//# sourceMappingURL=projects.repository.js.map