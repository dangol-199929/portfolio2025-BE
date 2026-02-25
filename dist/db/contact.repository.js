"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContact = getContact;
exports.updateContact = updateContact;
const prisma_1 = require("../lib/prisma");
const index_1 = require("./index");
function sqlite() {
    return (0, index_1.getSqliteDb)();
}
function parseItems(items) {
    try {
        const arr = JSON.parse(items || "[]");
        if (!Array.isArray(arr))
            return [];
        return arr.map((x) => ({
            label: String(x?.label ?? ""),
            value: String(x?.value ?? ""),
            href: String(x?.href ?? ""),
            target: x?.target != null ? String(x.target) : undefined,
            download: x?.download != null ? String(x.download) : undefined,
        }));
    }
    catch {
        return [];
    }
}
async function getContact() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const row = await (0, prisma_1.getPrisma)().contact.findUnique({ where: { id: 1 } });
            return parseItems(row?.items ?? "[]");
        }
        const row = sqlite()
            .prepare("SELECT items FROM contact WHERE id = 1")
            .get();
        return parseItems(row?.items ?? "[]");
    }
    catch {
        return [];
    }
}
async function updateContact(items) {
    const normalized = items.map((x) => ({
        label: String(x.label),
        value: String(x.value),
        href: String(x.href),
        target: x.target != null ? String(x.target) : undefined,
        download: x.download != null ? String(x.download) : undefined,
    }));
    try {
        if ((0, prisma_1.usePrisma)()) {
            await (0, prisma_1.getPrisma)().contact.upsert({
                where: { id: 1 },
                create: { id: 1, items: JSON.stringify(normalized) },
                update: { items: JSON.stringify(normalized) },
            });
            return normalized;
        }
        sqlite()
            .prepare("INSERT INTO contact (id, items) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET items=excluded.items")
            .run(JSON.stringify(normalized));
        return normalized;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=contact.repository.js.map