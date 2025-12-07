import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    uniqueIndex,
  } from "drizzle-orm/pg-core";
  import { orgUnits } from "./org";
  import { users } from "./users";
  import type {
    PositionLevel,
    PositionFunction,
    ScopeMode,
  } from "./types";
  
  export const unitMemberships = pgTable(
    "unit_memberships",
    {
      id: uuid("id").primaryKey().defaultRandom(),
  
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
  
      orgUnitId: uuid("org_unit_id")
        .notNull()
        .references(() => orgUnits.id, { onDelete: "cascade" }),
  
      positionLevel: text("position_level")
        .$type<PositionLevel>()
        .notNull(),
  
      positionFunction: text("position_function")
        .$type<PositionFunction>()
        .notNull(),
  
      positionTitle: text("position_title"),
  
      scopeMode: text("scope_mode")
        .$type<ScopeMode>()
        .notNull()
        .default("UNIT_ONLY"),
  
      isActive: boolean("is_active").notNull().default(true),
  
      createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    },
    (table) => ({
      // avoid duplicates: same user + same unit at the same time
      userUnitUnique: uniqueIndex("unit_memberships_user_unit_idx").on(
        table.userId,
        table.orgUnitId,
      ),
    }),
  );
  