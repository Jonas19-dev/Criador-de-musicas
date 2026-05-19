import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Composition,
  CompositionVersion,
  InsertComposition,
  InsertCompositionVersion,
  InsertUser,
  compositionVersions,
  compositions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Compositions ────────────────────────────────────────────────────────────

export async function saveComposition(data: InsertComposition): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(compositions).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateCompositionLyrics(id: number, lyrics: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(compositions).set({ lyrics, updatedAt: new Date() }).where(eq(compositions.id, id));
}

export async function getCompositionsByUser(userId: number): Promise<Composition[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(compositions)
    .where(eq(compositions.userId, userId))
    .orderBy(desc(compositions.createdAt))
    .limit(50);
}

export async function getCompositionById(id: number): Promise<Composition | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(compositions).where(eq(compositions.id, id)).limit(1);
  return result[0];
}

// ─── Composition Versions ────────────────────────────────────────────────────

export async function saveCompositionVersion(data: InsertCompositionVersion): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(compositionVersions).values(data);
}

export async function getVersionsByComposition(compositionId: number): Promise<CompositionVersion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(compositionVersions)
    .where(eq(compositionVersions.compositionId, compositionId))
    .orderBy(desc(compositionVersions.createdAt))
    .limit(20);
}
