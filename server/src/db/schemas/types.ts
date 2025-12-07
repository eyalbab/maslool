export type OrgUnitKind =
  | "BATTALION"
  | "BATTERY"
  | "PLATOON"
  | "TEAM"
  | "GENERIC";

export type PositionLevel =
  | "UNIT_COMMANDER"
  | "SUBUNIT_COMMANDER"
  | "TEAM_COMMANDER"
  | "SOLDIER";

export type PositionFunction =
  | "OPERATIONS"
  | "LOGISTICS"
  | "HR"
  | "GENERIC";

export type ScopeMode = "UNIT_ONLY" | "UNIT_AND_SUBTREE";


export type PermissionCode =
  | "TASK_VIEW_UNIT"
  | "TASK_ASSIGN"
  | "VACATION_REQUEST_OWN"
  | "VACATION_APPROVE"
  | "VACATION_VIEW_UNIT"
  | "EQUIPMENT_REQUEST_OWN"
  | "EQUIPMENT_MANAGE"
  | "SOLDIER_VIEW_BASIC"
  | "SOLDIER_VIEW_DETAILS"
  | "SOLDIER_MANAGE_PROFILE";
