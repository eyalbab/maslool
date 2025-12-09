# Maslool - Secure Soldier / Commander Operational Dashboard

**Maslool** is a secure operational dashboard system for military-style units (soldiers, team leaders, platoon commanders, battery commanders, logistics NCOs, etc.).  

The focus is on:

- **Strong RBAC & data isolation** between units.
- **Clear domain modeling** for hierarchical units (גדוד > סוללה > פלגה > צוות).
- **Auditability & safety** (activity logs, safe logging, minimal data exposure).
- A future **AI assistant** layer for summaries, overload detection, and task suggestions.

---

## Tech Stack

### Backend (`server/`)

- **Node.js** + **TypeScript**
- **Fastify** - lightweight, fast HTTP server
- **PostgreSQL** - relational database
- **Drizzle ORM** - type-safe queries + migrations
- **JWT auth** (access + HttpOnly refresh tokens) - to be wired in from a previous auth project

### Frontend (`client/`) - planned

- **React** + **TypeScript**
- SPA or Next.js (TBD)
- AuthContext + token refresh flow
- Role-based dashboards for different commanders/soldiers

---

## Domain Modeling (High-Level)

The system models a generic but realistic military structure:

- **OrgUnit** - hierarchical unit tree  
  e.g. `BATTALION > BATTERY > PLATOON > TEAM`  
  (in artillery: `גדוד > סוללה > פלגה > צוות`)

- **User** - authenticated identity (email, password hash, display name)

- **UnitMembership** - how a user relates to a specific unit:
  - `positionLevel` (e.g. `UNIT_COMMANDER`, `SUBUNIT_COMMANDER`, `TEAM_COMMANDER`, `SOLDIER`)
  - `positionFunction` (e.g. `OPERATIONS`, `LOGISTICS`, `HR`)
  - `scopeMode` (`UNIT_ONLY` vs `UNIT_AND_SUBTREE`)
  - This allows:
    - Battery commander seeing the whole battery subtree
    - Platoon commander seeing only their platoon
    - Team commander seeing only their team

- **MembershipPermissions** - per-membership permission overrides:
  - Default permissions are derived from `positionLevel` + `positionFunction`
  - Per-person overrides (GRANT/REVOKE) allow modeling real-world exceptions  
    (e.g. a logistics NCO who also handles man-management)

Upcoming entities (not all implemented yet):

- `Task` - operational tasks assigned to units/soldiers
- `VacationRequest` - leave/absence workflow
- `EquipmentRequest` - equipment & logistics workflow
- `Notification` - in-app notifications
- `ActivityLog` - audit trail for sensitive actions
- `AIInsight` - generated summaries / risk assessments per unit

---

## Security & Privacy Principles

- **Least privilege** - every API call is scoped by:
  - the caller’s `UnitMembership`
  - derived list of allowed unit IDs (unit + optional subtree)
  - effective permission set (default + membership overrides)

- **Multi-tenant isolation by design** - all queries use unit scoping to prevent cross-unit data leaks.

- **Careful logging**:
  - No password hashes or sensitive free-text in logs.
  - Activity logs store entity IDs and actions, not full payloads.

- **Future AI layer**:
  - AI will only see data already filtered by the same RBAC and unit scoping.

---

## Project Status

- ✅ Backend TypeScript + Drizzle setup
- ✅ Core DB schema:
  - `users`
  - `org_units`
  - `unit_memberships`
  - `membership_permissions`
- ⏳ Next:
  - Drizzle migrations (SQL) applied to the database
  - Seed script for a sample unit tree and user
  - First API endpoints:
    - `GET /me/memberships`
    - `GET /me/org-units`
  - Frontend bootstrap

---

## Getting Started (Backend)

### 1. Prerequisites

- Node.js (>= 18)
- PostgreSQL running locally
- pnpm / npm / yarn (examples use `npm`)

### 2. Clone & install

```bash
git clone https://github.com/eyalbab/maslool.git
cd maslool/server
npm install
