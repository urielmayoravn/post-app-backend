import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  is_completed: boolean("is_completed").default(false).notNull(),
  created_at: timestamp().defaultNow(),
});
