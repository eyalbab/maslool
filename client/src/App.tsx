// client/src/App.tsx
import "./index.css";
import "./app.css";

import { useMeMemberships } from "./features/me/api/useMemberships";
import type { OrgUnitKind } from "./features/me/api/types";

import { useTasks } from "./features/tasks/api/useTasks";
import type { TaskDTO, TaskType, TaskStatus } from "./features/tasks/api/types";

function formatOrgUnitKind(kind: OrgUnitKind) {
  switch (kind) {
    case "BATTALION":
      return "Battalion";
    case "BATTERY":
      return "Battery";
    case "PLATOON":
      return "Platoon";
    case "TEAM":
      return "Team";
    default:
      return "Unit";
  }
}

function formatTaskType(type: TaskType): string {
  switch (type) {
    case "KITCHEN_DUTY":
      return "Kitchen duty";
    case "GUARD_STATIC":
      return "Guard (static)";
    case "GUARD_PATROL":
      return "Guard (patrol)";
    case "BASE_CLEANING":
      return "Base cleaning";
    case "TRAINING_SESSION":
      return "Training / briefing";
    case "OTHER_DUTY":
    default:
      return "Other duty";
  }
}

function formatTaskStatus(status: TaskStatus): string {
  switch (status) {
    case "PLANNED":
      return "Planned";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function formatTimeRange(task: TaskDTO): string | null {
  if (!task.scheduledStart && !task.scheduledEnd) return null;

  const start = task.scheduledStart
    ? new Date(task.scheduledStart).toLocaleString()
    : null;
  const end = task.scheduledEnd
    ? new Date(task.scheduledEnd).toLocaleString()
    : null;

  if (start && end) return `${start} → ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return null;
}

export function App() {
  const {
    data: meData,
    isLoading: isMeLoading,
    isError: isMeError,
    error: meError,
  } = useMeMemberships();

  const membership = meData?.memberships[0] ?? null;
  const membershipId = membership?.id;

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
  } = useTasks({ membershipId });

  let roleContent: React.ReactNode;
  if (isMeLoading) {
    roleContent = <p>Loading your role and unit...</p>;
  } else if (isMeError) {
    const message =
      meError instanceof Error ? meError.message : "Unknown error";
    roleContent = (
      <p className="error-text">
        Failed to load your memberships. {message}
      </p>
    );
  } else if (!meData || !membership) {
    roleContent = (
      <p>
        No active memberships found for this user. Did you run the seed
        script?
      </p>
    );
  } else {
    const unitLabel = membership.unit
      ? `${formatOrgUnitKind(membership.unit.kind)} - ${
          membership.unit.name
        }`
      : "Unknown unit";

    roleContent = (
      <>
        <h2 className="app-section-title">Current Role</h2>
        <p>
          <strong>{meData.user.displayName}</strong>
        </p>
        <p>
          <span className="label">Email:</span> {meData.user.email}
        </p>
        <p>
          <span className="label">Unit:</span> {unitLabel}
        </p>
        <p>
          <span className="label">Position:</span>{" "}
          {membership.positionTitle || membership.positionLevel}
        </p>
        <p>
          <span className="label">Scope:</span> {membership.scopeMode}
        </p>
      </>
    );
  }

  let tasksContent: React.ReactNode;
  if (!membershipId) {
    tasksContent = null; // don't show tasks block if we don't know who we are
  } else if (isTasksLoading) {
    tasksContent = <p>Loading tasks for your unit...</p>;
  } else if (isTasksError) {
    const message =
      tasksError instanceof Error ? tasksError.message : "Unknown error";
    tasksContent = (
      <p className="error-text">
        Failed to load tasks. {message}
      </p>
    );
  } else if (!tasksData || tasksData.tasks.length === 0) {
    tasksContent = <p>No tasks found for your current role.</p>;
  } else {
    tasksContent = (
      <>
        <h2 className="app-section-title">Tasks for your unit</h2>
        <ul className="tasks-list">
          {tasksData.tasks.map((task) => {
            const timeRange = formatTimeRange(task);
            return (
              <li key={task.id} className="task-item">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  <span className={`task-status task-status-${task.status.toLowerCase()}`}>
                    {formatTaskStatus(task.status)}
                  </span>
                </div>
                <div className="task-meta-row">
                  <span className="task-type">{formatTaskType(task.type)}</span>
                  {timeRange && (
                    <span className="task-time">{timeRange}</span>
                  )}
                  <span className="task-priority">
                    Priority: {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Maslool Operational Dashboard</h1>
        <p className="app-subtitle">
          Secure soldier / commander dashboard - frontend scaffold
        </p>
      </header>

      <main className="app-main">
        <section className="app-panel">
          {roleContent}
          {membershipId && <hr className="section-divider" />}
          {tasksContent}
        </section>
      </main>
    </div>
  );
}

export default App;
