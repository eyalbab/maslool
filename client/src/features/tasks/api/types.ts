export type TaskType =
  | "KITCHEN_DUTY"
  | "GUARD_STATIC"
  | "GUARD_PATROL"
  | "BASE_CLEANING"
  | "TRAINING_SESSION"
  | "OTHER_DUTY";

export type TaskStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface TaskDTO {
  id: string;
  orgUnitId: string;
  assigneeMembershipId: string | null;
  createdByMembershipId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  dueAt: string | null;
}

export interface TasksResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  activeMembership: {
    id: string;
    positionLevel: string;
    positionFunction: string;
    positionTitle: string | null;
    scopeMode: string;
    orgUnitId: string;
  } | null;
  tasks: TaskDTO[];
}
