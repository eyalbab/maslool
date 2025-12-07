import type {
    PermissionCode,
    PositionLevel,
    PositionFunction,
  } from "../../db/schemas/types";
  import { eq } from "drizzle-orm";
  import { membershipPermissions } from "../../db/schemas/permissions";
  import { db } from "../../db/client";
  
  const defaultPermissions: 
  Record<
    PositionLevel,
    Record<PositionFunction, PermissionCode[]>
  > = {
    UNIT_COMMANDER: {
      OPERATIONS: [
        "TASK_VIEW_UNIT",
        "TASK_ASSIGN",
        "VACATION_VIEW_UNIT",
        "VACATION_APPROVE",
        "SOLDIER_VIEW_BASIC",
        "SOLDIER_VIEW_DETAILS",
      ],
      LOGISTICS: [
        "TASK_VIEW_UNIT",
        "EQUIPMENT_MANAGE",
        "SOLDIER_VIEW_BASIC",
      ],
      HR: [
        "VACATION_VIEW_UNIT",
        "VACATION_APPROVE",
        "SOLDIER_VIEW_DETAILS",
        "SOLDIER_MANAGE_PROFILE",
      ],
      GENERIC: ["SOLDIER_VIEW_BASIC"],
    },
    SUBUNIT_COMMANDER: {
      OPERATIONS: [
        "TASK_VIEW_UNIT",
        "TASK_ASSIGN",
        "VACATION_VIEW_UNIT",
        "VACATION_APPROVE",
        "SOLDIER_VIEW_BASIC",
        "SOLDIER_VIEW_DETAILS",
      ],
      LOGISTICS: ["TASK_VIEW_UNIT", "EQUIPMENT_MANAGE", "SOLDIER_VIEW_BASIC"],
      HR: [
        "VACATION_VIEW_UNIT",
        "VACATION_APPROVE",
        "SOLDIER_VIEW_DETAILS",
        "SOLDIER_MANAGE_PROFILE",
      ],
      GENERIC: ["SOLDIER_VIEW_BASIC"],
    },
    TEAM_COMMANDER: {
      OPERATIONS: [
        "TASK_VIEW_UNIT",
        "TASK_ASSIGN",
        "SOLDIER_VIEW_BASIC",
      ],
      LOGISTICS: ["TASK_VIEW_UNIT", "EQUIPMENT_MANAGE"],
      HR: ["VACATION_VIEW_UNIT", "SOLDIER_VIEW_DETAILS"],
      GENERIC: ["SOLDIER_VIEW_BASIC"],
    },
    SOLDIER: {
      OPERATIONS: [
        "TASK_VIEW_UNIT",
        "VACATION_REQUEST_OWN",
        "EQUIPMENT_REQUEST_OWN",
      ],
      LOGISTICS: ["EQUIPMENT_REQUEST_OWN"],
      HR: ["VACATION_REQUEST_OWN"],
      GENERIC: ["VACATION_REQUEST_OWN", "EQUIPMENT_REQUEST_OWN"],
    },
  };
  
  export async function getEffectivePermissionsForMembership(
    membershipId: string,
    positionLevel: PositionLevel,
    positionFunction: PositionFunction,
  ): Promise<Set<PermissionCode>> {
    const base =
      defaultPermissions[positionLevel]?.[positionFunction] ?? [];
    const perms = new Set<PermissionCode>(base);
  
    const overrides = await db
      .select()
      .from(membershipPermissions)
      .where(eq(membershipPermissions.membershipId, membershipId));
  
    for (const o of overrides) {
      if (o.mode === "GRANT") perms.add(o.code);
      if (o.mode === "REVOKE") perms.delete(o.code);
    }
  
    return perms;
  }
  