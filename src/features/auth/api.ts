import { api } from "@/lib/api";
import type { LoginInput, RegisterInput } from "./schemas";

export async function login(data: LoginInput) {
  return api<{ token: string }>("/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterInput) {
  return api<void>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken() {
  return api<{ token: string }>("/token/refresh", {
    method: "PATCH",
  });
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  created_at: string;
}

export async function getProfile() {
  return api<{ user: User }>("/me");
}
