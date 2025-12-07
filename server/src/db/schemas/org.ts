import {
    pgTable,
    uuid,
    text,
    timestamp,
    foreignKey,
  } from "drizzle-orm/pg-core";
  import type { OrgUnitKind } from "./types";
  
  export const orgUnits = pgTable(
    "org_units",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      name: text("name").notNull(),
      kind: text("kind").$type<OrgUnitKind>().notNull(),
      parentUnitId: uuid("parent_unit_id"),
      createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    },
    (table) => ({
      parentFk: foreignKey({
        columns: [table.parentUnitId],
        foreignColumns: [table.id],
        name: "org_units_parent_fk",
      }).onDelete("set null"),
    }),
  );
  