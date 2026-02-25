import { getPrisma, usePrisma } from "../lib/prisma";
import { getSqliteDb } from "./index";

export type AboutRecord = {
  name: string;
  email: string;
  education: string;
  availability: string;
  bio: string[];
  image: string;
};

const DEFAULT_ABOUT: AboutRecord = {
  name: "",
  email: "",
  education: "",
  availability: "",
  bio: [],
  image: "",
};

function sqlite() {
  return getSqliteDb();
}

function parseBio(bio: string): string[] {
  try {
    const arr = JSON.parse(bio || "[]");
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export async function getAbout(): Promise<AboutRecord> {
  try {
    if (usePrisma()) {
      const row = await getPrisma().about.findUnique({ where: { id: 1 } });
      if (!row) return DEFAULT_ABOUT;
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
      .prepare(
        "SELECT name, email, education, availability, bio, image FROM about WHERE id = 1",
      )
      .get() as
      | {
          name: string;
          email: string;
          education: string;
          availability: string;
          bio: string;
          image: string;
        }
      | undefined;
    if (!row) return DEFAULT_ABOUT;
    return {
      name: row.name,
      email: row.email,
      education: row.education,
      availability: row.availability,
      bio: parseBio(row.bio),
      image: row.image,
    };
  } catch {
    return DEFAULT_ABOUT;
  }
}

export async function updateAbout(
  data: Partial<AboutRecord>,
): Promise<AboutRecord> {
  const current = await getAbout();
  const merged: AboutRecord = {
    name: data.name ?? current.name,
    email: data.email ?? current.email,
    education: data.education ?? current.education,
    availability: data.availability ?? current.availability,
    bio: data.bio ?? current.bio,
    image: data.image ?? current.image,
  };

  try {
    if (usePrisma()) {
      await getPrisma().about.upsert({
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
      .prepare(
        "INSERT INTO about (id, name, email, education, availability, bio, image) VALUES (1, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, education=excluded.education, availability=excluded.availability, bio=excluded.bio, image=excluded.image",
      )
      .run(
        merged.name,
        merged.email,
        merged.education,
        merged.availability,
        JSON.stringify(merged.bio),
        merged.image,
      );
    return merged;
  } catch (error) {
    throw error;
  }
}
