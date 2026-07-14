import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchNearbyGyms, registerGym, searchGyms } from "./api";

export function useGymsSearch(query: string, page: number) {
  return useQuery({
    queryKey: ["gyms", "search", { query, page }],
    queryFn: () => searchGyms(query, page),
  });
}

export function useNearbyGyms(
  latitude: number | null,
  longitude: number | null,
) {
  return useQuery({
    queryKey: ["gyms", "nearby", { latitude, longitude }],
    queryFn: () => fetchNearbyGyms(latitude!, longitude!),
    enabled: latitude !== null && longitude !== null,
  });
}

export function useRegisterGymMutation() {
  return useMutation({
    mutationFn: registerGym,
  });
}
