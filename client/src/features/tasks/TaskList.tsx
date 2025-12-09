import type { TaskDTO, TaskStatus, TaskType } from "./api";

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

type Props = {
  tasks: TaskDTO[];
};

export function TaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return <p>No tasks found for your current role.</p>;
  }

  return (
    <>
      <h2 className="app-section-title">Tasks for your unit</h2>
      <ul className="tasks-list">
        {tasks.map((task) => {
          const timeRange = formatTimeRange(task);
          return (
            <li key={task.id} className="task-item">
              <div className="task-title-row">
                <span className="task-title">{task.title}</span>
                <span
                  className={`task-status task-status-${task.status.toLowerCase()}`}
                >
                  {formatTaskStatus(task.status)}
                </span>
              </div>
              <div className="task-meta-row">
                <span className="task-type">
                  {formatTaskType(task.type)}
                </span>
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
