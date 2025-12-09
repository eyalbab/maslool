import type {
    MeMembershipsResponse,
    OrgUnitKind,
  } from "./api";
  
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
  
  type Props = {
    data: MeMembershipsResponse;
  };
  
  export function CurrentRoleCard({ data }: Props) {
    const membership = data.memberships[0];
    const unitLabel = membership.unit
      ? `${formatOrgUnitKind(membership.unit.kind)} – ${
          membership.unit.name
        }`
      : "Unknown unit";
  
    return (
      <>
        <h2 className="app-section-title">Current Role</h2>
        <p>
          <strong>{data.user.displayName}</strong>
        </p>
        <p>
          <span className="label">Email:</span> {data.user.email}
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
  