"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExperiences = getAllExperiences;
exports.countExperiences = countExperiences;
exports.insertExperience = insertExperience;
exports.findExperienceById = findExperienceById;
exports.updateExperience = updateExperience;
exports.deleteExperience = deleteExperience;
const index_1 = __importDefault(require("./index"));
const logger_1 = require("../utils/logger");
function getAllExperiences() {
    try {
        const rows = index_1.default
            .prepare("SELECT * FROM experiences ORDER BY id")
            .all();
        return rows;
    }
    catch (error) {
        logger_1.logger.error("Failed to fetch experiences", error);
        throw error;
    }
}
function countExperiences() {
    try {
        const row = index_1.default.prepare("SELECT COUNT(*) as c FROM experiences").get();
        return row.c;
    }
    catch (error) {
        logger_1.logger.error("Failed to count experiences", error);
        throw error;
    }
}
function insertExperience(experience) {
    const stmt = index_1.default.prepare("INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)");
    try {
        stmt.run(experience.id, experience.title, experience.company, experience.period, experience.description, experience.side);
        const row = index_1.default
            .prepare("SELECT * FROM experiences WHERE id = ?")
            .get(experience.id);
        return row;
    }
    catch (error) {
        logger_1.logger.error("Failed to insert experience", error);
        throw error;
    }
}
function findExperienceById(id) {
    try {
        const row = index_1.default.prepare("SELECT * FROM experiences WHERE id = ?").get(id);
        return row;
    }
    catch (error) {
        logger_1.logger.error("Failed to find experience by id", { id, error });
        throw error;
    }
}
function updateExperience(experience) {
    const stmt = index_1.default.prepare("UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?");
    try {
        stmt.run(experience.title, experience.company, experience.period, experience.description, experience.side, experience.id);
        const row = index_1.default
            .prepare("SELECT * FROM experiences WHERE id = ?")
            .get(experience.id);
        return row;
    }
    catch (error) {
        logger_1.logger.error("Failed to update experience", { id: experience.id, error });
        throw error;
    }
}
function deleteExperience(id) {
    try {
        index_1.default.prepare("DELETE FROM experiences WHERE id = ?").run(id);
    }
    catch (error) {
        logger_1.logger.error("Failed to delete experience", { id, error });
        throw error;
    }
}
//# sourceMappingURL=experiences.repository.js.map