import type { FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { users } from "../db/schemas/users";
import { unitMemberships } from "../db/schemas/membership";

// TEMP: Hard-coded dev user until we wire JWT.
// You can also move this to .env later as DEV_USER_EMAIL.
const DEV_USER_EMAIL = "eyal.platoon.cmd@example.com";

export type CurrentUser = typeof users.$inferSelect;
export type CurrentMembership = typeof unitMemberships.$inferSelect;

export type CurrentUserWithMemberships = {
  user: CurrentUser;
  memberships: CurrentMembership[];
};

/**
 * Resolve the "current user" and all their memberships.
 *
 * Today:
 *   - Uses a fixed DEV email (single user).
 * Later:
 *   - Will read userId from JWT attached to the request.
 */
export async function getCurrentUserWithMemberships(
  _request: FastifyRequest,
): Promise<CurrentUserWithMemberships> {
  // 1) Find user (later: by JWT userId)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEV_USER_EMAIL));

  if (!user) {
    throw new Error(
      "DEV user not found. Did you run `npm run seed:init`?",
    );
  }

  // 2) Load memberships
  const memberships = await db
    .select()
    .from(unitMemberships)
    .where(eq(unitMemberships.userId, user.id));

  return { user, memberships };
}
