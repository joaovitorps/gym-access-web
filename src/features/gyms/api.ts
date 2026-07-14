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

function normalizeGym(gym: Gym): Gym {
  return {
    ...gym,
    latitude: Number(gym.latitude),
    longitude: Number(gym.longitude),
  };
}

export async function searchGyms(query: string, page: number) {
  const data = await api<{ gyms: Gym[] }>(
    `/gyms/search?q=${encodeURIComponent(query)}&page=${page}`,
  );

  return { ...data, gyms: data.gyms.map(normalizeGym) };
}

export async function fetchNearbyGyms(latitude: number, longitude: number) {
  const data = await api<{ gyms: Gym[] }>(
    `/gyms/nearby?latitude=${latitude}&longitude=${longitude}`,
  );

  return { ...data, gyms: data.gyms.map(normalizeGym) };
}

export async function registerGym(data: RegisterGymInput) {
  return api<void>("/gyms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
