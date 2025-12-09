import type { CurrentMembership } from "./currentUser";

export function canAssignTasks(membership: CurrentMembership): boolean {
  // Simple rule for v1: commanders can assign tasks, soldiers can't.
  if (membership.positionLevel === "SOLDIER") {
    return false;
  }

  // Optionally we can restrict by function later (OPERATIONS/LOGISTICS only)
  return true;
}
