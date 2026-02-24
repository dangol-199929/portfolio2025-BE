import { getPrisma, usePrisma } from "../lib/prisma";
import { getSqliteDb } from "./index";

const DEFAULT_RESUME_PATH = "/resume/Resume.pdf";

function sqlite() {
  return getSqliteDb();
}

export async function getResumePath(): Promise<string> {
  try {
    if (usePrisma()) {
      const row = await getPrisma().settings.findUnique({
        where: { id: 1 },
      });
      return row?.resumePath ?? DEFAULT_RESUME_PATH;
    }

    const row = sqlite().prepare("SELECT resumePath FROM settings WHERE id = 1").get() as
      | { resumePath: string }
      | undefined;
    return row?.resumePath ?? DEFAULT_RESUME_PATH;
  } catch {
    return DEFAULT_RESUME_PATH;
  }
}

export async function setResumePath(resumePath: string): Promise<void> {
  if (usePrisma()) {
    await getPrisma().settings.upsert({
      where: { id: 1 },
      create: { id: 1, resumePath },
      update: { resumePath },
    });
    return;
  }

  sqlite().prepare("UPDATE settings SET resumePath = ? WHERE id = 1").run(resumePath);
}
