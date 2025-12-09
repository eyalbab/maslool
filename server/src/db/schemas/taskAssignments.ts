import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
  } from "drizzle-orm/pg-core";
  import { tasks } from "./tasks";
  import { unitMemberships } from "./membership";
  
  export const taskAssignments = pgTable(
    "task_assignments",
    {
      id: uuid("id").primaryKey().defaultRandom(),
  
      taskId: uuid("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
  
      membershipId: uuid("membership_id")
        .notNull()
        .references(() => unitMemberships.id, { onDelete: "cascade" }),
  
      // optional: GUARD, PARTICIPANT, COORDINATOR, etc.
      roleInTask: text("role_in_task").notNull().default("GUARD"),
  
      slotStart: timestamp("slot_start", { withTimezone: true }).notNull(),
      slotEnd: timestamp("slot_end", { withTimezone: true }).notNull(),
  
      createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    },
    (table) => ({
      // useful composite index for queries like:
      // - assignments by task
      // - guard history for a soldier
      byTask: index("task_assignments_task_idx").on(table.taskId),
      byMembership: index("task_assignments_membership_idx").on(
        table.membershipId,
      ),
    }),
  );
  