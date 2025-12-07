import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex,
  } from "drizzle-orm/pg-core";
  import { unitMemberships } from "./membership";
  import type { PermissionCode } from "./types";
  
  export type PermissionMode = "GRANT" | "REVOKE";
  
  export const membershipPermissions = pgTable(
    "membership_permissions",
    {
      id: uuid("id").primaryKey().defaultRandom(),
  
      membershipId: uuid("membership_id")
        .notNull()
        .references(() => unitMemberships.id, {
          onDelete: "cascade",
        }),
  
      code: text("code").$type<PermissionCode>().notNull(),
  
      mode: text("mode").$type<PermissionMode>().notNull(),
  
      createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    },
    (table) => ({
      // one row per (membership, code); mode decides GRANT/REVOKE
      membershipCodeUnique: uniqueIndex(
        "membership_permissions_membership_code_idx",
      ).on(table.membershipId, table.code),
    }),
  );
  