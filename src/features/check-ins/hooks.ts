import { useMutation, useQuery } from "@tanstack/react-query";
import { isSameDay } from "@/lib/utils";
import {
  checkIn,
  fetchCheckInHistory,
  fetchCheckInMetrics,
  validateCheckIn,
} from "./api";

export function useCheckInHistory(page: number) {
  return useQuery({
    queryKey: ["check-ins", "history", { page }],
    queryFn: () => fetchCheckInHistory(page),
  });
}

export interface UseHasCheckedInTodayResult {
  hasCheckedInToday: boolean;
  checkedInTodayGymId: string | null;
  checkedInTodayCreatedAt: string | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: ReturnType<typeof useCheckInHistory>["refetch"];
}

/**
 * Augments `useCheckInHistory(1)` to determine whether the user has already
 * checked in today and to which gym. Relies on the backend returning history
 * newest-first; only the first (index 0) entry is inspected.
 */
export function useHasCheckedInToday(): UseHasCheckedInTodayResult {
  const query = useCheckInHistory(1);
  const latest = query.data?.checkIns?.[0];
  const hasCheckedInToday = !!latest && isSameDay(latest.created_at);

  return {
    hasCheckedInToday,
    checkedInTodayGymId: hasCheckedInToday ? latest.gym_id : null,
    checkedInTodayCreatedAt: hasCheckedInToday ? latest.created_at : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCheckInMetrics() {
  return useQuery({
    queryKey: ["check-ins", "metrics"],
    queryFn: fetchCheckInMetrics,
  });
}

export function useCheckInMutation() {
  return useMutation({
    mutationFn: ({
      gymId,
      latitude,
      longitude,
    }: {
      gymId: string;
      latitude: number;
      longitude: number;
    }) => checkIn(gymId, latitude, longitude),
  });
}

export function useValidateCheckInMutation() {
  return useMutation({
    mutationFn: validateCheckIn,
  });
}
