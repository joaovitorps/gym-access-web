import { useMutation, useQuery } from "@tanstack/react-query";
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
