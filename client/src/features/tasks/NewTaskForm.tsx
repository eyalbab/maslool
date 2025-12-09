import { type FormEvent, useState } from "react";
import { useCreateTask } from "./api";
import type { TaskType, TaskPriority } from "./api";

type Props = {
  membershipId: string;
  orgUnitId: string;
};

const DEFAULT_TYPE: TaskType = "KITCHEN_DUTY";
const DEFAULT_PRIORITY: TaskPriority = "NORMAL";

export function NewTaskForm({ membershipId, orgUnitId }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>(DEFAULT_TYPE);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [description, setDescription] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");

  const { mutate, isPending, isError, error } = useCreateTask();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    mutate(
      {
        membershipId,
        orgUnitId,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        scheduledStart: scheduledStart || null,
        scheduledEnd: scheduledEnd || null,
        dueAt: null,
        assigneeMembershipId: null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setScheduledStart("");
          setScheduledEnd("");
          setType(DEFAULT_TYPE);
          setPriority(DEFAULT_PRIORITY);
        },
      },
    );
  }

  const errorMessage =
    isError && error instanceof Error ? error.message : null;

  return (
    <form className="new-task-form" onSubmit={handleSubmit}>
      <h2 className="app-section-title">Create new task</h2>

      <div className="form-row">
        <label>
          <span className="form-label">Title</span>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Night guard 00:00–04:00"
            required
          />
        </label>
      </div>

      <div className="form-row form-row-inline">
        <label>
          <span className="form-label">Type</span>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            <option value="KITCHEN_DUTY">Kitchen duty</option>
            <option value="GUARD_STATIC">Guard (static)</option>
            <option value="GUARD_PATROL">Guard (patrol)</option>
            <option value="BASE_CLEANING">Base cleaning</option>
            <option value="TRAINING_SESSION">Training / briefing</option>
            <option value="OTHER_DUTY">Other duty</option>
          </select>
        </label>

        <label>
          <span className="form-label">Priority</span>
          <select
            className="form-select"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as TaskPriority)
            }
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </label>
      </div>

      <div className="form-row form-row-inline">
        <label>
          <span className="form-label">Start</span>
          <input
            className="form-input"
            type="datetime-local"
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
          />
        </label>

        <label>
          <span className="form-label">End</span>
          <input
            className="form-input"
            type="datetime-local"
            value={scheduledEnd}
            onChange={(e) => setScheduledEnd(e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          <span className="form-label">Description</span>
          <textarea
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details, location, number of soldiers needed..."
          />
        </label>
      </div>

      {errorMessage && (
        <p className="error-text small">
          Failed to create task. {errorMessage}
        </p>
      )}

      <div className="form-row form-actions">
        <button
          className="primary-button"
          type="submit"
          disabled={isPending || !title.trim()}
        >
          {isPending ? "Creating..." : "Create task"}
        </button>
      </div>
    </form>
  );
}
