"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.createOne = createOne;
exports.updateOne = updateOne;
exports.deleteOne = deleteOne;
const db_1 = __importDefault(require("../db"));
const defaults = {
    liveUrl: '#',
    githubUrl: '#',
    tags: [],
    metrics: [],
    title: '',
    description: '',
    fullDescription: '',
    image: '',
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
        tags: JSON.parse(row.tags || '[]'),
        liveUrl: row.liveUrl,
        githubUrl: row.githubUrl,
        metrics: JSON.parse(row.metrics || '[]'),
    };
}
function getAll(_req, res, next) {
    try {
        const rows = db_1.default.prepare('SELECT * FROM projects ORDER BY id').all();
        res.status(200).json(rows.map(rowToProject));
    }
    catch {
        res.status(200).json([]);
    }
}
function createOne(req, res, next) {
    const body = applyDefaults(req.body);
    const id = Date.now().toString();
    const tagsJson = JSON.stringify(body.tags);
    const metricsJson = JSON.stringify(body.metrics);
    const stmt = db_1.default.prepare('INSERT INTO projects (id, title, description, fullDescription, image, tags, liveUrl, githubUrl, metrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    try {
        stmt.run(id, body.title, body.description, body.fullDescription, body.image, tagsJson, body.liveUrl, body.githubUrl, metricsJson);
        const row = db_1.default.prepare('SELECT * FROM projects WHERE id = ?').get(id);
        res.status(201).json(rowToProject(row));
    }
    catch {
        const err = new Error('Failed to create project');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function updateOne(req, res, next) {
    const body = req.body;
    const { id } = body;
    if (!id) {
        const err = new Error('id is required');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = db_1.default.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) {
        const err = new Error('Project not found');
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    const current = rowToProject(existing);
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
    const tagsJson = JSON.stringify(merged.tags);
    const metricsJson = JSON.stringify(merged.metrics);
    const stmt = db_1.default.prepare('UPDATE projects SET title = ?, description = ?, fullDescription = ?, image = ?, tags = ?, liveUrl = ?, githubUrl = ?, metrics = ? WHERE id = ?');
    try {
        stmt.run(merged.title, merged.description, merged.fullDescription, merged.image, tagsJson, merged.liveUrl, merged.githubUrl, metricsJson, id);
        res.status(200).json(merged);
    }
    catch {
        const err = new Error('Failed to update project');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function deleteOne(req, res, next) {
    const id = req.query.id;
    if (!id) {
        const err = new Error('ID is required');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = db_1.default.prepare('SELECT id FROM projects WHERE id = ?').get(id);
    if (!existing) {
        const err = new Error('Project not found');
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    try {
        db_1.default.prepare('DELETE FROM projects WHERE id = ?').run(id);
        res.status(200).json({ success: true });
    }
    catch {
        const err = new Error('Failed to delete project');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=projects.controller.js.map