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

  createdAt: t.timestamp("created_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),

  lastUsedAt: t.timestamp("last_used_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
}));
