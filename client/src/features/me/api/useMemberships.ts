import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/httpClient";
import type { MeMembershipsResponse } from "./types";

const ME_MEMBERSHIPS_QUERY_KEY = ["me-memberships"] as const;

/**
 * React Query hook to fetch current user's memberships.
 */
export function useMeMemberships() {
  return useQuery({
    queryKey: ME_MEMBERSHIPS_QUERY_KEY,
    queryFn: () => apiGet<MeMembershipsResponse>("/me/memberships"),
    // You can tweak staleTime / refetch behavior later
  });
}
