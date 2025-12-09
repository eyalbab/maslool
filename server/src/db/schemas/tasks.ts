import {
    pgTable,
    uuid,
    text,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { orgUnits } from "./org";
  import { unitMemberships } from "./membership";
  
  // If you want strong typing, you can define TS unions like:
  export type TaskType =
    | "KITCHEN_DUTY"
    | "GUARD_STATIC"
    | "GUARD_PATROL"
    | "BASE_CLEANING"
    | "TRAINING_SESSION"
    | "OTHER_DUTY";
  
  export type TaskStatus =
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  
  export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  
  export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
  
    // Which unit owns this task (for scoping and dashboards)
    orgUnitId: uuid("org_unit_id")
      .notNull()
      .references(() => orgUnits.id, {
        onDelete: "cascade",
      }),
  
    // Optional direct assignee (e.g. specific soldier or commander)
    assigneeMembershipId: uuid("assignee_membership_id").references(
      () => unitMemberships.id,
      { onDelete: "set null" },
    ),
  
    // Who created the task (for audit / UI)
    createdByMembershipId: uuid("created_by_membership_id").references(
      () => unitMemberships.id,
      { onDelete: "set null" },
    ),
  
    title: text("title").notNull(),
  
    description: text("description"),
  
    type: text("type")
      // If you want strong typing in TS:
      .$type<TaskType>()
      .notNull(),
  
    status: text("status")
      .$type<TaskStatus>()
      .notNull()
      .default("PLANNED"),
  
    priority: text("priority")
      .$type<TaskPriority>()
      .notNull()
      .default("NORMAL"),
  
    // When is this duty supposed to happen?
    // For daily duties, usually same day/time window.
    scheduledStart: timestamp("scheduled_start", {
      withTimezone: true,
    }),
    scheduledEnd: timestamp("scheduled_end", {
      withTimezone: true,
    }),
  
    // Optional due time (e.g. must be done by 10:00)
    dueAt: timestamp("due_at", { withTimezone: true }),
  
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  });
  