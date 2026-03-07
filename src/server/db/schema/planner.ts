import { integer, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../create-table";
import { sql } from "drizzle-orm";
import { user } from "./user";

export const studyPlans = createTable("study_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  hoursPerDay: integer("hours_per_day").notNull(),
  subjects: text("subjects").notNull(),
  plan: text("plan").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
