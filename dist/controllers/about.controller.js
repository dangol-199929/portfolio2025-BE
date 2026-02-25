"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAboutHandler = getAboutHandler;
exports.putAboutHandler = putAboutHandler;
const about_repository_1 = require("../db/about.repository");
async function getAboutHandler(_req, res, next) {
    try {
        const data = await (0, about_repository_1.getAbout)();
        res.status(200).json(data);
    }
    catch (e) {
        next(e);
    }
}
async function putAboutHandler(req, res, next) {
    const body = req.body;
    try {
        const updated = await (0, about_repository_1.updateAbout)(body);
        res.status(200).json(updated);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=about.controller.js.map