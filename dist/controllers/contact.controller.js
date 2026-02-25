"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactHandler = getContactHandler;
exports.putContactHandler = putContactHandler;
const contact_repository_1 = require("../db/contact.repository");
async function getContactHandler(_req, res, next) {
    try {
        const items = await (0, contact_repository_1.getContact)();
        res.status(200).json(items);
    }
    catch (e) {
        next(e);
    }
}
async function putContactHandler(req, res, next) {
    const body = req.body;
    if (!Array.isArray(body)) {
        const err = new Error("Body must be an array of contact items");
        err.statusCode = 400;
        err.expose = true;
        return next(err);
    }
    try {
        const updated = await (0, contact_repository_1.updateContact)(body);
        res.status(200).json(updated);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=contact.controller.js.map