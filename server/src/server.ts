// server/src/server.ts
import "dotenv/config";
import Fastify from "fastify";
import { eq, inArray } from "drizzle-orm";

import { db } from "./db/client";
import { users } from "./db/schemas/users";
import { unitMemberships } from "./db/schemas/membership";
import { orgUnits } from "./db/schemas/org";
import { getCurrentUserWithMemberships } from "./services/currentUser";
import { getAllowedUnitIdsForMembership } from "./services/orgScope";


const fastify = Fastify({
  logger: true,
});

// TEMP: we'll later get userId from JWT.
// For now, use the seeded user's email from seedInitialOrg.ts
const DEV_USER_EMAIL = "eyal.platoon.cmd@example.com";

fastify.get("/health", async () => {
  return { status: "ok" };
});

fastify.get("/me/memberships", async (request) => {
  const { user, memberships } = await getCurrentUserWithMemberships(request);

  if (memberships.length === 0) {
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      memberships: [],
    };
  }
  const unitIds = memberships.map((m) => m.orgUnitId);

  let units: (typeof orgUnits.$inferSelect)[] = [];
  if (unitIds.length > 0) {
    units = await db
      .select()
      .from(orgUnits)
      .where(inArray(orgUnits.id, unitIds));
  }

  const unitsById = new Map(units.map((u) => [u.id, u]));

  const membershipsDto = memberships.map((m) => {
    const unit = unitsById.get(m.orgUnitId);
    return {
      id: m.id,
      unit: unit
        ? {
            id: unit.id,
            name: unit.name,
            kind: unit.kind,
          }
        : null,
      positionLevel: m.positionLevel,
      positionFunction: m.positionFunction,
      positionTitle: m.positionTitle,
      scopeMode: m.scopeMode,
      isActive: m.isActive,
    };
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    memberships: membershipsDto,
  };
});

type OrgTreeNode = {
    id: string;
    name: string;
    kind: string;
    children: OrgTreeNode[];
  };
  
  // GET /me/org-tree
  // Returns the org units the current user is allowed to see, as a tree.
  // For now we assume a single membership; later we'll support choosing which membership to act as.
  fastify.get("/me/org-tree", async (request) => {
    const { user, memberships } = await getCurrentUserWithMemberships(request);
  
    if (memberships.length === 0) {
      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        activeMembership: null,
        orgTree: [],
      };
    }
  
    // For now: pick the first membership as the "active" one.
    const activeMembership = memberships[0];
  
    // Compute allowed unit IDs for this membership
    const allowedUnitIds = await getAllowedUnitIdsForMembership(
      activeMembership,
    );
  
    // Fetch those units
    const units = await db
      .select()
      .from(orgUnits)
      .where(inArray(orgUnits.id, allowedUnitIds));
  
    // Build tree: map id -> node skeleton
    const nodeById = new Map<string, OrgTreeNode>();
    for (const u of units) {
      nodeById.set(u.id, {
        id: u.id,
        name: u.name,
        kind: u.kind,
        children: [],
      });
    }
  
    // Attach children to parents if parent is also in allowed set
    const roots: OrgTreeNode[] = [];
    const allowedSet = new Set(allowedUnitIds);
  
    for (const u of units) {
      const node = nodeById.get(u.id)!;
      const parentId = u.parentUnitId;
  
      if (parentId && allowedSet.has(parentId) && nodeById.has(parentId)) {
        nodeById.get(parentId)!.children.push(node);
      } else {
        // no parent in allowed set => this is a root in the visible tree
        roots.push(node);
      }
    }
  
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      activeMembership: {
        id: activeMembership.id,
        positionLevel: activeMembership.positionLevel,
        positionFunction: activeMembership.positionFunction,
        positionTitle: activeMembership.positionTitle,
        scopeMode: activeMembership.scopeMode,
        orgUnitId: activeMembership.orgUnitId,
      },
      orgTree: roots,
    };
  });
  

// GET /debug/me-memberships
// Returns: the current user's memberships + their units
fastify.get("/debug/me-memberships", async () => {
  // 1) Find the user by email (later we’ll use JWT userId)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEV_USER_EMAIL));

  if (!user) {
    return {
      error: "DEV user not found – did you run `npm run seed:init`?",
    };
  }

  // 2) Get memberships for that user
  const memberships = await db
    .select()
    .from(unitMemberships)
    .where(eq(unitMemberships.userId, user.id));

  if (memberships.length === 0) {
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      memberships: [],
    };
  }

  // 3) Fetch the units for those memberships
  const unitIds = memberships.map((m) => m.orgUnitId);

  let units: (typeof orgUnits.$inferSelect)[] = [];
  if (unitIds.length > 0) {
    units = await db
      .select()
      .from(orgUnits)
      .where(inArray(orgUnits.id, unitIds));
  }

  // 4) Join in memory
  const unitsById = new Map(units.map((u) => [u.id, u]));

  const payload = memberships.map((m) => ({
    membershipId: m.id,
    unit: unitsById.get(m.orgUnitId),
    positionLevel: m.positionLevel,
    positionFunction: m.positionFunction,
    positionTitle: m.positionTitle,
    scopeMode: m.scopeMode,
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    memberships: payload,
  };
});

const port = Number(process.env.PORT || 3000);

fastify
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    fastify.log.info(`Server listening on port ${port}`);
  })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
