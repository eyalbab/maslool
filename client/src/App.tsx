import "./index.css";
import "./app.css";

import { useMeMemberships } from "./features/me/api";
import { useTasks } from "./features/tasks/api";
import { CurrentRoleCard } from "./features/me/CurrentRoleCard";
import { TaskList } from "./features/tasks/TaskList";

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
    roleContent = <CurrentRoleCard data={meData} />;
  }

  let tasksContent: React.ReactNode = null;
  if (membershipId) {
    if (isTasksLoading) {
      tasksContent = <p>Loading tasks for your unit...</p>;
    } else if (isTasksError) {
      const message =
        tasksError instanceof Error ? tasksError.message : "Unknown error";
      tasksContent = (
        <p className="error-text">
          Failed to load tasks. {message}
        </p>
      );
    } else if (tasksData) {
      tasksContent = <TaskList tasks={tasksData.tasks} />;
    }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Maslool Operational Dashboard</h1>
        <p className="app-subtitle">
          Secure soldier / commander dashboard – frontend scaffold
        </p>
      </header>

      <main className="app-main">
        <section className="app-panel">
          {roleContent}
          {membershipId && tasksContent && (
            <hr className="section-divider" />
          )}
          {tasksContent}
        </section>
      </main>
    </div>
  );
}

export default App;
