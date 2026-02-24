"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumePath = getResumePath;
exports.setResumePath = setResumePath;
const prisma_1 = require("../lib/prisma");
const index_1 = require("./index");
const DEFAULT_RESUME_PATH = "/resume/Resume.pdf";
function sqlite() {
    return (0, index_1.getSqliteDb)();
}
async function getResumePath() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const row = await (0, prisma_1.getPrisma)().settings.findUnique({
                where: { id: 1 },
            });
            return row?.resumePath ?? DEFAULT_RESUME_PATH;
        }
        const row = sqlite().prepare("SELECT resumePath FROM settings WHERE id = 1").get();
        return row?.resumePath ?? DEFAULT_RESUME_PATH;
    }
    catch {
        return DEFAULT_RESUME_PATH;
    }
}
async function setResumePath(resumePath) {
    if ((0, prisma_1.usePrisma)()) {
        await (0, prisma_1.getPrisma)().settings.upsert({
            where: { id: 1 },
            create: { id: 1, resumePath },
            update: { resumePath },
        });
        return;
    }
    sqlite().prepare("UPDATE settings SET resumePath = ? WHERE id = 1").run(resumePath);
}
//# sourceMappingURL=settings.repository.js.map