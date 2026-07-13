import { api } from "@/lib/api";
import type { RegisterGymInput } from "./schemas";

export interface Gym {
  id: string;
  title: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
}

export async function searchGyms(query: string, page: number) {
  return api<{ gyms: Gym[] }>(
    `/gyms/search?q=${encodeURIComponent(query)}&page=${page}`,
  );
}

export async function fetchNearbyGyms(latitude: number, longitude: number) {
  return api<{ gyms: Gym[] }>(
    `/gyms/nearby?latitude=${latitude}&longitude=${longitude}`,
  );
}

export async function registerGym(data: RegisterGymInput) {
  return api<void>("/gyms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
