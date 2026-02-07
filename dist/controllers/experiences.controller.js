"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.createOne = createOne;
exports.updateOne = updateOne;
exports.deleteOne = deleteOne;
const experiences_repository_1 = require("../db/experiences.repository");
function getAll(_req, res, next) {
    try {
        const experiences = (0, experiences_repository_1.getAllExperiences)();
        res.status(200).json(experiences);
    }
    catch {
        res.status(200).json([]);
    }
}
function createOne(req, res, next) {
    const body = req.body;
    const id = Date.now().toString();
    let side = body.side;
    if (side !== "left" && side !== "right") {
        const count = (0, experiences_repository_1.countExperiences)();
        side = count % 2 === 0 ? "right" : "left";
    }
    try {
        const row = (0, experiences_repository_1.insertExperience)({
            id,
            title: body.title ?? "",
            company: body.company ?? "",
            period: body.period ?? "",
            description: body.description ?? "",
            side,
        });
        res.status(201).json(row);
    }
    catch {
        const err = new Error("Failed to create experience");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function updateOne(req, res, next) {
    const body = req.body;
    const { id, title, company, period, description, side } = body;
    if (!id) {
        const err = new Error("id is required");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = (0, experiences_repository_1.findExperienceById)(id);
    if (!existing) {
        const err = new Error("Experience not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    try {
        const row = (0, experiences_repository_1.updateExperience)({
            id,
            title: title ?? "",
            company: company ?? "",
            period: period ?? "",
            description: description ?? "",
            side: side ?? "right",
        });
        res.status(200).json(row);
    }
    catch {
        const err = new Error("Failed to update experience");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function deleteOne(req, res, next) {
    const id = req.query.id;
    if (!id) {
        const err = new Error("ID is required");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = (0, experiences_repository_1.findExperienceById)(id);
    if (!existing) {
        const err = new Error("Experience not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    try {
        (0, experiences_repository_1.deleteExperience)(id);
        res.status(200).json({ success: true });
    }
    catch {
        const err = new Error("Failed to delete experience");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=experiences.controller.js.map