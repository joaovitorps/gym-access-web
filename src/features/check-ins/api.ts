import { api } from "@/lib/api";

export interface CheckIn {
  id: string;
  created_at: string;
  validated_at: string | null;
  gym_id: string;
  user_id: string;
}

export async function checkIn(
  gymId: string,
  latitude: number,
  longitude: number,
) {
  return api<void>(`/gyms/${gymId}/check-ins`, {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  });
}

export async function fetchCheckInHistory(page: number) {
  return api<{ checkIns: CheckIn[] }>(`/check-ins/history?page=${page}`);
}

export async function fetchAllCheckInsHistory(page: number) {
  return api<{ checkIns: CheckIn[] }>(`/check-ins?page=${page}`);
}

export async function fetchCheckInMetrics() {
  return api<{ userTotalOfCheckIns: number }>("/check-ins/metrics");
}

export async function validateCheckIn(checkInId: string) {
  return api<{ checkIn: CheckIn }>(`/check-ins/${checkInId}/validate`, {
    method: "PATCH",
  });
}
