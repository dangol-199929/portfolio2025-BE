"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbout = getAbout;
exports.updateAbout = updateAbout;
const prisma_1 = require("../lib/prisma");
const index_1 = require("./index");
const DEFAULT_ABOUT = {
    name: "",
    email: "",
    education: "",
    availability: "",
    bio: [],
    image: "",
};
function sqlite() {
    return (0, index_1.getSqliteDb)();
}
function parseBio(bio) {
    try {
        const arr = JSON.parse(bio || "[]");
        return Array.isArray(arr) ? arr.map(String) : [];
    }
    catch {
        return [];
    }
}
async function getAbout() {
    try {
        if ((0, prisma_1.usePrisma)()) {
            const row = await (0, prisma_1.getPrisma)().about.findUnique({ where: { id: 1 } });
            if (!row)
                return DEFAULT_ABOUT;
            return {
                name: row.name,
                email: row.email,
                education: row.education,
                availability: row.availability,
                bio: parseBio(row.bio),
                image: row.image,
            };
        }
        const row = sqlite()
            .prepare("SELECT name, email, education, availability, bio, image FROM about WHERE id = 1")
            .get();
        if (!row)
            return DEFAULT_ABOUT;
        return {
            name: row.name,
            email: row.email,
            education: row.education,
            availability: row.availability,
            bio: parseBio(row.bio),
            image: row.image,
        };
    }
    catch {
        return DEFAULT_ABOUT;
    }
}
async function updateAbout(data) {
    const current = await getAbout();
    const merged = {
        name: data.name ?? current.name,
        email: data.email ?? current.email,
        education: data.education ?? current.education,
        availability: data.availability ?? current.availability,
        bio: data.bio ?? current.bio,
        image: data.image ?? current.image,
    };
    try {
        if ((0, prisma_1.usePrisma)()) {
            await (0, prisma_1.getPrisma)().about.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    name: merged.name,
                    email: merged.email,
                    education: merged.education,
                    availability: merged.availability,
                    bio: JSON.stringify(merged.bio),
                    image: merged.image,
                },
                update: {
                    name: merged.name,
                    email: merged.email,
                    education: merged.education,
                    availability: merged.availability,
                    bio: JSON.stringify(merged.bio),
                    image: merged.image,
                },
            });
            return merged;
        }
        sqlite()
            .prepare("INSERT INTO about (id, name, email, education, availability, bio, image) VALUES (1, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, education=excluded.education, availability=excluded.availability, bio=excluded.bio, image=excluded.image")
            .run(merged.name, merged.email, merged.education, merged.availability, JSON.stringify(merged.bio), merged.image);
        return merged;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=about.repository.js.map