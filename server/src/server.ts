// server/src/server.ts
import "dotenv/config";
import Fastify from "fastify";
import { eq, inArray } from "drizzle-orm";
import cors from "@fastify/cors";


import { db } from "./db/client";
import { users } from "./db/schemas/users";
import { unitMemberships } from "./db/schemas/membership";
import { orgUnits } from "./db/schemas/org";
import { tasks } from "./db/schemas/tasks";
import { getCurrentUserWithMemberships } from "./services/currentUser";
import { getAllowedUnitIdsForMembership } from "./services/orgScope";
import { canAssignTasks } from "./services/taskPermissions";
import type { CurrentMembership } from "./services/currentUser";
import type { TaskType, TaskPriority } from "./db/schemas/tasks";


const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
    origin: ["http://localhost:5173"],
    credentials: true,
  });

// TEMP: we'll later get userId from JWT.
// For now, use the seeded user's email from seedInitialOrg.ts
const DEV_USER_EMAIL = "eyal.platoon.cmd@example.com";

function pickActiveMembership(
  memberships: CurrentMembership[],
  membershipId?: string
): CurrentMembership | null {
  if (memberships.length === 0) return null;
  if (!membershipId) return memberships[0];

  const found = memberships.find((m) => m.id === membershipId);
  return found ?? null;
}

type CreateTaskBody = {
    membershipId: string; // acting as this membership
    orgUnitId: string;
    title: string;
    description?: string;
    type: TaskType;
    priority?: TaskPriority;
    scheduledStart?: string; // ISO strings from client
    scheduledEnd?: string;
    dueAt?: string;
    assigneeMembershipId?: string;
  };

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
  const allowedUnitIds = await getAllowedUnitIdsForMembership(activeMembership);

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
type GetTasksQuery = {
  membershipId?: string;
  scope?: "UNIT_ONLY" | "SUBTREE"; // SUBTREE => use UNIT_AND_SUBTREE behavior
};

fastify.get<{
  Querystring: GetTasksQuery;
}>("/tasks", async (request) => {
  const { membershipId, scope } = request.query;
  const { user, memberships } = await getCurrentUserWithMemberships(request);

  const activeMembership = pickActiveMembership(memberships, membershipId);
  if (!activeMembership) {
    return {
      error: "No valid membership for this user",
    };
  }

  // Compute allowed unit IDs
  let allowedUnitIds: string[];

  if (scope === "UNIT_ONLY") {
    allowedUnitIds = [activeMembership.orgUnitId];
  } else {
    // default: use full scope mode (UNIT_ONLY vs UNIT_AND_SUBTREE)
    allowedUnitIds = await getAllowedUnitIdsForMembership(activeMembership);
  }

  const taskRows = await db
    .select()
    .from(tasks)
    .where(inArray(tasks.orgUnitId, allowedUnitIds));

  // Simple DTO mapping
  const dto = taskRows.map((t) => ({
    id: t.id,
    orgUnitId: t.orgUnitId,
    assigneeMembershipId: t.assigneeMembershipId,
    createdByMembershipId: t.createdByMembershipId,
    title: t.title,
    description: t.description,
    type: t.type,
    status: t.status,
    priority: t.priority,
    scheduledStart: t.scheduledStart,
    scheduledEnd: t.scheduledEnd,
    dueAt: t.dueAt,
  }));

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
    tasks: dto,
  };
});

fastify.post<{
    Body: CreateTaskBody;
  }>("/tasks", async (request, reply) => {
    const body = request.body;
    const { membershipId } = body;
  
    const { user, memberships } = await getCurrentUserWithMemberships(request);
  
    const activeMembership = pickActiveMembership(memberships, membershipId);
    if (!activeMembership) {
      reply.code(400);
      return { error: "Invalid membershipId for this user" };
    }
  
    // Basic RBAC: only commanders can assign tasks
    if (!canAssignTasks(activeMembership)) {
      reply.code(403);
      return { error: "Not allowed to assign tasks" };
    }
  
    // Compute allowed unit IDs for this membership
    const allowedUnitIds = await getAllowedUnitIdsForMembership(
      activeMembership,
    );
  
    // Ensure the target orgUnitId is within allowed scope
    if (!allowedUnitIds.includes(body.orgUnitId)) {
      reply.code(403);
      return { error: "Cannot create tasks for this org unit" };
    }
  
    // Optional: validate assigneeMembershipId belongs to allowed units
    let assigneeMembershipId: string | null = null;
    if (body.assigneeMembershipId) {
      const [assignee] = await db
        .select()
        .from(unitMemberships)
        .where(eq(unitMemberships.id, body.assigneeMembershipId));
  
      if (!assignee) {
        reply.code(400);
        return { error: "Invalid assigneeMembershipId" };
      }
  
      if (!allowedUnitIds.includes(assignee.orgUnitId)) {
        reply.code(403);
        return {
          error:
            "Cannot assign tasks to someone outside your allowed unit scope",
        };
      }
  
      assigneeMembershipId = assignee.id;
    }
  
    const scheduledStart = body.scheduledStart
      ? new Date(body.scheduledStart)
      : null;
    const scheduledEnd = body.scheduledEnd
      ? new Date(body.scheduledEnd)
      : null;
    const dueAt = body.dueAt ? new Date(body.dueAt) : null;
  
    const [created] = await db
      .insert(tasks)
      .values({
        orgUnitId: body.orgUnitId,
        assigneeMembershipId,
        createdByMembershipId: activeMembership.id,
        title: body.title,
        description: body.description ?? null,
        type: body.type,
        status: "PLANNED",
        priority: body.priority ?? "NORMAL",
        scheduledStart,
        scheduledEnd,
        dueAt,
      })
      .returning();
  
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      task: {
        id: created.id,
        orgUnitId: created.orgUnitId,
        assigneeMembershipId: created.assigneeMembershipId,
        createdByMembershipId: created.createdByMembershipId,
        title: created.title,
        description: created.description,
        type: created.type,
        status: created.status,
        priority: created.priority,
        scheduledStart: created.scheduledStart,
        scheduledEnd: created.scheduledEnd,
        dueAt: created.dueAt,
      },
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
      error: "DEV user not found - did you run `npm run seed:init`?",
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
