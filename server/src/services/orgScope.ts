import { db } from "../db/client";
import { orgUnits } from "../db/schemas/org";
import type { CurrentMembership } from "./currentUser";

/**
 * Get all org units as a simple array.
 * For now, we load all into memory; this is fine for a single battalion-scale system.
 */
async function getAllOrgUnits() {
  return db.select().from(orgUnits);
}

/**
 * Given all units and a root unit ID, return the IDs in that unit's subtree
 * (including the root itself).
 */
function collectSubtreeUnitIds(
  allUnits: typeof orgUnits.$inferSelect[],
  rootId: string,
): string[] {
  const childrenByParent = new Map<string | null, string[]>();

  for (const u of allUnits) {
    const parentId = u.parentUnitId ?? null;
    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }
    childrenByParent.get(parentId)!.push(u.id);
  }

  const result: string[] = [];
  const stack: string[] = [rootId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);

    const children = childrenByParent.get(current) ?? [];
    for (const childId of children) {
      stack.push(childId);
    }
  }

  return result;
}

/**
 * Compute allowed unit IDs for a membership, based on:
 * - membership.orgUnitId
 * - membership.scopeMode ("UNIT_ONLY" | "UNIT_AND_SUBTREE")
 */
export async function getAllowedUnitIdsForMembership(
  membership: CurrentMembership,
): Promise<string[]> {
  const allUnits = await getAllOrgUnits();

  if (membership.scopeMode === "UNIT_ONLY") {
    return [membership.orgUnitId];
  }

  if (membership.scopeMode === "UNIT_AND_SUBTREE") {
    return collectSubtreeUnitIds(allUnits, membership.orgUnitId);
  }

  // Fallback - be conservative
  return [membership.orgUnitId];
}
