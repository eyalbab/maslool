import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex,
  } from "drizzle-orm/pg-core";
  
  export const users = pgTable(
    "users",
    {
      id: uuid("id").primaryKey().defaultRandom(),
  
      email: text("email").notNull(),
      passwordHash: text("password_hash").notNull(),
      displayName: text("display_name").notNull(),
  
      // optional global role (for system admin)
      globalRole: text("global_role").default("NONE"),
  
      createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    },
    (table) => ({ 
      emailUnique: uniqueIndex("users_email_idx").on(table.email),
    }),
  );
  