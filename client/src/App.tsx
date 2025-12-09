import "./index.css";
import "./app.css";

export function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Maslool Operational Dashboard</h1>
        <p className="app-subtitle">
          Frontend scaffold – React + TypeScript + Vite
        </p>
      </header>

      <main className="app-main">
        <section className="app-panel">
          <h2>Getting Started</h2>
          <ul>
            <li>Backend: <code>GET /me/memberships</code> is live.</li>
            <li>Backend: <code>GET /me/org-tree</code> is live.</li>
            <li>Backend: <code>GET /tasks</code> and <code>POST /tasks</code> are live.</li>
          </ul>
          <p>
            Next step: connect this UI to the API using a typed HTTP client and
            React Query.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
