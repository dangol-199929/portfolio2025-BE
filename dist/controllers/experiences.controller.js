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
function getAll(_req, res, next) {
    try {
        const rows = db_1.default.prepare('SELECT * FROM experiences ORDER BY id').all();
        res.status(200).json(rows);
    }
    catch {
        res.status(200).json([]);
    }
}
function createOne(req, res, next) {
    const body = req.body;
    const id = Date.now().toString();
    let side = body.side;
    if (side !== 'left' && side !== 'right') {
        const count = db_1.default.prepare('SELECT COUNT(*) as c FROM experiences').get().c;
        side = count % 2 === 0 ? 'right' : 'left';
    }
    const stmt = db_1.default.prepare('INSERT INTO experiences (id, title, company, period, description, side) VALUES (?, ?, ?, ?, ?, ?)');
    try {
        stmt.run(id, body.title ?? '', body.company ?? '', body.period ?? '', body.description ?? '', side);
        const row = db_1.default.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
        res.status(201).json(row);
    }
    catch {
        const err = new Error('Failed to create experience');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
function updateOne(req, res, next) {
    const body = req.body;
    const { id, title, company, period, description, side } = body;
    if (!id) {
        const err = new Error('id is required');
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    const existing = db_1.default.prepare('SELECT id FROM experiences WHERE id = ?').get(id);
    if (!existing) {
        const err = new Error('Experience not found');
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    const stmt = db_1.default.prepare('UPDATE experiences SET title = ?, company = ?, period = ?, description = ?, side = ? WHERE id = ?');
    try {
        stmt.run(title ?? '', company ?? '', period ?? '', description ?? '', side ?? 'right', id);
        const row = db_1.default.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
        res.status(200).json(row);
    }
    catch {
        const err = new Error('Failed to update experience');
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
    const existing = db_1.default.prepare('SELECT id FROM experiences WHERE id = ?').get(id);
    if (!existing) {
        const err = new Error('Experience not found');
        err.statusCode = 404;
        err.expose = true;
        return next(err);
    }
    try {
        db_1.default.prepare('DELETE FROM experiences WHERE id = ?').run(id);
        res.status(200).json({ success: true });
    }
    catch {
        const err = new Error('Failed to delete experience');
        err.statusCode = 500;
        err.expose = true;
        next(err);
    }
}
//# sourceMappingURL=experiences.controller.js.map