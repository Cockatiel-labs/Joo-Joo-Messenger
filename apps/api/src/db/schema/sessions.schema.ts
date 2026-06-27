import { pgTable } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users.schema";

export const sessions = pgTable("sessions", (t) => ({
  id: t
    .uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),

  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  userAgent: t.varchar("user_agent", { length: 255 }),
  refreshTokenHash: t.varchar("refresh_token_hash", { length: 255 }),
  expiresAt: t.timestamp("expires_at", { mode: "date", precision: 3, withTimezone: true }),
  revokedAt: t.timestamp("revoked_at", { mode: "date", precision: 3, withTimezone: true }),
  createdAt: t.timestamp("created_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: t.timestamp("last_used_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
}));
