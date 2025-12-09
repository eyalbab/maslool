# Maslool Client - Operational Dashboard Frontend

This is the **React + TypeScript** frontend for the Maslool project - a secure soldier/commander operational dashboard.

Tech stack (current status):

- React + TypeScript
- Vite dev server
- Basic layout + styling

Backend endpoints currently available:

- `GET /me/memberships` - current user roles & units
- `GET /me/org-tree` - visible org structure for active role
- `GET /tasks` - tasks scoped to the caller’s units
- `POST /tasks` - create tasks (for commanders)

Next steps (planned):

- Add an HTTP client layer with typed responses (Zod)
- Integrate React Query for data fetching and caching
- Add routing and feature-based folder structure (auth, org, tasks, etc.)
- Implement role-based dashboards for commanders and soldiers
