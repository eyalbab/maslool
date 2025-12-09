export type PositionLevel =
  | "UNIT_COMMANDER"
  | "SUBUNIT_COMMANDER"
  | "TEAM_COMMANDER"
  | "SOLDIER";

export type PositionFunction = "OPERATIONS" | "LOGISTICS" | "HR" | "GENERIC";

export type OrgUnitKind =
  | "BATTALION"
  | "BATTERY"
  | "PLATOON"
  | "TEAM"
  | "GENERIC";

export type ScopeMode = "UNIT_ONLY" | "UNIT_AND_SUBTREE";

export interface MeMembershipsResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  memberships: {
    id: string;
    unit: {
      id: string;
      name: string;
      kind: OrgUnitKind;
    } | null;
    positionLevel: PositionLevel;
    positionFunction: PositionFunction;
    positionTitle: string | null;
    scopeMode: ScopeMode;
    isActive: boolean;
  }[];
}

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../shared/api/httpClient";

const ME_MEMBERSHIPS_QUERY_KEY = ["me-memberships"] as const;

export function useMeMemberships() {
  return useQuery({
    queryKey: ME_MEMBERSHIPS_QUERY_KEY,
    queryFn: () => apiGet<MeMembershipsResponse>("/me/memberships"),
  });
}
