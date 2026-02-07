"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.createOne = createOne;
exports.updateOne = updateOne;
exports.deleteOne = deleteOne;
const projects_repository_1 = require("../db/projects.repository");
const defaults = {
    liveUrl: "#",
    githubUrl: "#",
    tags: [],
    metrics: [],
    title: "",
    description: "",
    fullDescription: "",
    image: "",
};
function applyDefaults(body) {
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
function getAll(_req, res, next) {
    try {
        const projects = (0, projects_repository_1.getAllProjects)();
        res.status(200).json(projects);
    }
    catch {
        res.status(200).json([]);
    }
}
function createOne(req, res, next) {
    const body = applyDefaults(req.body);
    const id = Date.now().toString();
    try {
        const row = (0, projects_repository_1.insertProject)({
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
    }
    catch {
        const err = new Error("Failed to create project");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function updateOne(req, res, next) {
    const body = req.body;
    const { id } = body;
    if (!id) {
        const err = new Error("id is required");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = (0, projects_repository_1.findProjectById)(id);
    if (!existing) {
        const err = new Error("Project not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    const current = existing;
    const merged = {
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
        const updated = (0, projects_repository_1.updateProject)(merged);
        res.status(200).json(updated);
    }
    catch {
        const err = new Error("Failed to update project");
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
    const existing = (0, projects_repository_1.findProjectById)(id);
    if (!existing) {
        const err = new Error("Project not found");
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    try {
        (0, projects_repository_1.deleteProject)(id);
        res.status(200).json({ success: true });
    }
    catch {
        const err = new Error("Failed to delete project");
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=projects.controller.js.map