import "dotenv/config";
import { db } from "../db/client";
import { orgUnits } from "../db/schemas/org";
import { users } from "../db/schemas/users";
import { unitMemberships } from "../db/schemas/membership";
import type {
  OrgUnitKind,
  PositionLevel,
  PositionFunction,
  ScopeMode,
} from "../db/schemas/types";

async function main() {
  console.log("Seeding initial org structure and user...");

  // 1) Create org units: גדוד > סוללה > פלגה > צוות
  const [battalion] = await db
    .insert(orgUnits)
    .values({
      name: "Artillery Battalion 1",
      kind: "BATTALION" as OrgUnitKind,
      parentUnitId: null,
    })
    .returning();

  const [battery] = await db
    .insert(orgUnits)
    .values({
      name: "Battery Aleph",
      kind: "BATTERY" as OrgUnitKind,
      parentUnitId: battalion.id,
    })
    .returning();

  const [platoon] = await db
    .insert(orgUnits)
    .values({
      name: "Platoon A",
      kind: "PLATOON" as OrgUnitKind,
      parentUnitId: battery.id,
    })
    .returning();

  const [team] = await db
    .insert(orgUnits)
    .values({
      name: "Team 1",
      kind: "TEAM" as OrgUnitKind,
      parentUnitId: platoon.id,
    })
    .returning();

  console.log("Created units:", {
    battalion: battalion.id,
    battery: battery.id,
    platoon: platoon.id,
    team: team.id,
  });

  // 2) Create a user (you) – we'll refine password hashing later
  const [user] = await db
    .insert(users)
    .values({
      email: "eyal.platoon.cmd@example.com",
      passwordHash: "DEV_ONLY_NOT_HASHED", // TODO: replace with real hash later
      displayName: "Eyal – Platoon Commander",
      globalRole: "NONE",
    })
    .returning();

  console.log("Created user:", user.id);

  // 3) Create a UnitMembership: you as מפקד פלגה on that platoon
  const [membership] = await db
    .insert(unitMemberships)
    .values({
      userId: user.id,
      orgUnitId: platoon.id,
      positionLevel: "SUBUNIT_COMMANDER" as PositionLevel,
      positionFunction: "OPERATIONS" as PositionFunction,
      positionTitle: "מפקד פלגה",
      scopeMode: "UNIT_ONLY" as ScopeMode,
      isActive: true,
    })
    .returning();

  console.log("Created membership:", membership.id);

  console.log("✅ Seed complete.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
