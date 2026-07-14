import { calculateDistance, formatDistance, formatDateTime, isSameDay } from "./utils";

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

describe("isSameDay", () => {
  it("returns true when the ISO timestamp is on the same local date as the reference", () => {
    const ref = new Date(2026, 6, 13, 15, 0, 0);
    expect(isSameDay("2026-07-13T10:00:00.000Z", ref)).toBe(true);
  });

  it("returns false for the next day", () => {
    const ref = new Date(2026, 6, 13, 15, 0, 0);
    expect(isSameDay("2026-07-14T10:00:00.000Z", ref)).toBe(false);
  });

  it("returns false for the previous day", () => {
    const ref = new Date(2026, 6, 13, 15, 0, 0);
    expect(isSameDay("2026-07-12T10:00:00.000Z", ref)).toBe(false);
  });

  it("returns false for a different year and month", () => {
    const ref = new Date(2026, 6, 13, 15, 0, 0);
    expect(isSameDay("2025-06-13T10:00:00.000Z", ref)).toBe(false);
  });
});
