import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const compositions = mysqlTable("compositions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  theme: varchar("theme", { length: 500 }).notNull(),
  genre: mysqlEnum("genre", ["pop", "rock", "rap_hiphop", "eletronico", "sertanejo", "trap"]).notNull(),
  mood: varchar("mood", { length: 255 }).notNull(),
  keywords: text("keywords"),
  lyrics: text("lyrics").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Composition = typeof compositions.$inferSelect;
export type InsertComposition = typeof compositions.$inferInsert;

export const compositionVersions = mysqlTable("composition_versions", {
  id: int("id").autoincrement().primaryKey(),
  compositionId: int("compositionId").notNull(),
  lyrics: text("lyrics").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompositionVersion = typeof compositionVersions.$inferSelect;
export type InsertCompositionVersion = typeof compositionVersions.$inferInsert;
