import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/httpClient";
import type { TasksResponse } from "./types";

type UseTasksOptions = {
  membershipId?: string;
};

const TASKS_QUERY_KEY = ["tasks"] as const;

export function useTasks({ membershipId }: UseTasksOptions) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, { membershipId }],
    queryFn: () =>
      apiGet<TasksResponse>(`/tasks?membershipId=${membershipId}`),
    enabled: !!membershipId, // don't run until we know the membership
  });
}
