import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { fetchNearbyGyms, searchGyms } from "../api";

describe("gym API", () => {
  it("normalizes string latitude/longitude from search response", async () => {
    server.use(
      http.get("*/gyms/search", () => {
        return HttpResponse.json({
          gyms: [
            {
              id: "gym-1",
              title: "JS Gym",
              description: null,
              phone: null,
              latitude: "-23.5216",
              longitude: "-46.6712",
            },
          ],
        });
      }),
    );

    const data = await searchGyms("JS", 1);

    expect(data.gyms[0].latitude).toBe(-23.5216);
    expect(data.gyms[0].longitude).toBe(-46.6712);
    expect(typeof data.gyms[0].latitude).toBe("number");
    expect(typeof data.gyms[0].longitude).toBe("number");
  });

  it("normalizes string latitude/longitude from nearby response", async () => {
    server.use(
      http.get("*/gyms/nearby", () => {
        return HttpResponse.json({
          gyms: [
            {
              id: "gym-1",
              title: "Nearby Gym",
              description: null,
              phone: null,
              latitude: "-23.5216",
              longitude: "-46.6712",
            },
          ],
        });
      }),
    );

    const data = await fetchNearbyGyms(-23.5, -46.6);

    expect(data.gyms[0].latitude).toBe(-23.5216);
    expect(data.gyms[0].longitude).toBe(-46.6712);
    expect(typeof data.gyms[0].latitude).toBe("number");
    expect(typeof data.gyms[0].longitude).toBe("number");
  });
});
