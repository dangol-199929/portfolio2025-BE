"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = getAllProjects;
exports.findProjectById = findProjectById;
exports.insertProject = insertProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
const index_1 = __importDefault(require("./index"));
const logger_1 = require("../utils/logger");
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
function getAllProjects() {
    try {
        const rows = index_1.default
            .prepare("SELECT * FROM projects ORDER BY id")
            .all();
        return rows.map(rowToProject);
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch projects", error);
        throw error;
    }
}
function findProjectById(id) {
    try {
        const row = index_1.default.prepare("SELECT * FROM projects WHERE id = ?").get(id);
        return row ? rowToProject(row) : undefined;
    }
    catch (error) {
        logger_1.logger.error("Failed to find project by id", { id, error });
        throw error;
    }
}
function insertProject(project) {
    const row = projectToRow(project);
    const stmt = index_1.default.prepare("INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    try {
        stmt.run(row.id, row.title, row.description, row.fullDescription, row.image, row.tags, row.liveUrl, row.githubUrl, row.metrics);
        const inserted = index_1.default
            .prepare("SELECT * FROM projects WHERE id = ?")
            .get(row.id);
        return rowToProject(inserted);
    }
    catch (error) {
        logger_1.logger.error("Failed to insert project", { id: project.id, error });
        throw error;
    }
}
function updateProject(project) {
    const row = projectToRow(project);
    const stmt = index_1.default.prepare("UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?");
    try {
        stmt.run(row.title, row.description, row.fullDescription, row.image, row.tags, row.liveUrl, row.githubUrl, row.metrics, row.id);
        const updated = index_1.default
            .prepare("SELECT * FROM projects WHERE id = ?")
            .get(row.id);
        return rowToProject(updated);
    }
    catch (error) {
        logger_1.logger.error("Failed to update project", { id: project.id, error });
        throw error;
    }
}
function deleteProject(id) {
    try {
        index_1.default.prepare("DELETE FROM projects WHERE id = ?").run(id);
    }
    catch (error) {
        logger_1.logger.error("Failed to delete project", { id, error });
        throw error;
    }
}
//# sourceMappingURL=projects.repository.js.map