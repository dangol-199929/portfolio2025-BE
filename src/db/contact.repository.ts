import { getPrisma, usePrisma } from "../lib/prisma";
import { getSqliteDb } from "./index";

export type ContactItem = {
  label: string;
  value: string;
  href: string;
  target?: string;
  download?: string;
};

function sqlite() {
  return getSqliteDb();
}

function parseItems(items: string): ContactItem[] {
  try {
    const arr = JSON.parse(items || "[]");
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => ({
      label: String(x?.label ?? ""),
      value: String(x?.value ?? ""),
      href: String(x?.href ?? ""),
      target: x?.target != null ? String(x.target) : undefined,
      download: x?.download != null ? String(x.download) : undefined,
    }));
  } catch {
    return [];
  }
}

export async function getContact(): Promise<ContactItem[]> {
  try {
    if (usePrisma()) {
      const row = await getPrisma().contact.findUnique({ where: { id: 1 } });
      return parseItems(row?.items ?? "[]");
    }

    const row = sqlite()
      .prepare("SELECT items FROM contact WHERE id = 1")
      .get() as { items: string } | undefined;
    return parseItems(row?.items ?? "[]");
  } catch {
    return [];
  }
}

export async function updateContact(
  items: ContactItem[],
): Promise<ContactItem[]> {
  const normalized = items.map((x) => ({
    label: String(x.label),
    value: String(x.value),
    href: String(x.href),
    target: x.target != null ? String(x.target) : undefined,
    download: x.download != null ? String(x.download) : undefined,
  }));

  try {
    if (usePrisma()) {
      await getPrisma().contact.upsert({
        where: { id: 1 },
        create: { id: 1, items: JSON.stringify(normalized) },
        update: { items: JSON.stringify(normalized) },
      });
      return normalized;
    }

    sqlite()
      .prepare(
        "INSERT INTO contact (id, items) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET items=excluded.items",
      )
      .run(JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    throw error;
  }
}
