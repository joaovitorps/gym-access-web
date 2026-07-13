import { calculateDistance, formatDistance, formatDateTime } from "./utils";

describe("calculateDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(calculateDistance(10, 20, 10, 20)).toBe(0);
  });

  it("calculates distance between two known points", () => {
    const distance = calculateDistance(
      -23.521609,
      -46.671253,
      -23.521609,
      -46.670253,
    );

    expect(distance).toBeGreaterThan(90);
    expect(distance).toBeLessThan(110);
  });
});

describe("formatDistance", () => {
  it("formats meters for short distances", () => {
    expect(formatDistance(50)).toBe("50 m");
  });

  it("formats kilometers for long distances", () => {
    expect(formatDistance(1500)).toBe("1.5 km");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO string", () => {
    expect(formatDateTime("2026-07-13T10:00:00.000Z")).toContain("Jul 13");
  });
});
