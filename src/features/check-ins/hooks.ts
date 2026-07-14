import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkIn,
  fetchAllCheckInsHistory,
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

export function useAllCheckInsHistory(page: number) {
  return useQuery({
    queryKey: ["check-ins", "all", { page }],
    queryFn: () => fetchAllCheckInsHistory(page),
  });
}

export function useCheckInsHistory(page: number, isAdmin: boolean) {
  return useQuery({
    queryKey: isAdmin
      ? ["check-ins", "all", { page }]
      : ["check-ins", "history", { page }],
    queryFn: () =>
      isAdmin ? fetchAllCheckInsHistory(page) : fetchCheckInHistory(page),
  });
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
