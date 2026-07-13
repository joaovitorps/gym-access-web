import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("*/sessions", async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    if (body.email === "bad@example.com") {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    return HttpResponse.json({ token: "access-token" });
  }),

  http.post("*/users", async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    if (body.email === "exists@example.com") {
      return HttpResponse.json({ message: "User already exists" }, { status: 409 });
    }

    return new HttpResponse(null, { status: 201 });
  }),

  http.patch("*/token/refresh", () => {
    return HttpResponse.json({ token: "refreshed-token" });
  }),

  http.get("*/me", () => {
    return HttpResponse.json({
      user: {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        role: "MEMBER",
        created_at: "2026-07-13T21:47:02.453Z",
      },
    });
  }),

  http.get("*/gyms/search", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    if (!q) {
      return HttpResponse.json({ gyms: [] });
    }

    return HttpResponse.json({
      gyms: [
        {
          id: "gym-1",
          title: `${q} Gym`,
          description: "A great gym",
          phone: "1234567890",
          latitude: -23.5216,
          longitude: -46.6712,
        },
      ],
    });
  }),

  http.get("*/gyms/nearby", () => {
    return HttpResponse.json({
      gyms: [
        {
          id: "gym-1",
          title: "Nearby Gym",
          description: null,
          phone: null,
          latitude: -23.5216,
          longitude: -46.6712,
        },
      ],
    });
  }),

  http.post("*/gyms", () => {
    return new HttpResponse(null, { status: 201 });
  }),

  http.get("*/check-ins/history", () => {
    return HttpResponse.json({
      checkIns: [
        {
          id: "checkin-1",
          created_at: "2026-07-13T10:00:00.000Z",
          validated_at: null,
          gym_id: "gym-1",
          user_id: "user-1",
        },
      ],
    });
  }),

  http.get("*/check-ins/metrics", () => {
    return HttpResponse.json({ userTotalOfCheckIns: 42 });
  }),

  http.post("*/gyms/:gymId/check-ins", () => {
    return new HttpResponse(null, { status: 201 });
  }),

  http.patch("*/check-ins/:checkInId/validate", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
