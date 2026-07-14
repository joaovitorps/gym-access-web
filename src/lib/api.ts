export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

export function getApiToken() {
  return authToken;
}

export async function api<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getApiToken();

  const response = await fetch(`${API_URL}${input}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new ApiError(response.status, body.message || "Request failed");
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
