import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHasCheckedInToday } from "../hooks";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useHasCheckedInToday", () => {
  beforeEach(() => {
    // The default MSW handler returns a check-in from 2026-07-13.
    // Pin "today" to the same local date so the hook flags it as today's.
    vi.useFakeTimers({
      now: new Date(2026, 6, 13, 15, 0, 0),
      shouldAdvanceTime: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns hasCheckedInToday=true and the gym id when the latest check-in is today", async () => {
    const { result } = renderHook(() => useHasCheckedInToday(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasCheckedInToday).toBe(true);
    expect(result.current.checkedInTodayGymId).toBe("gym-1");
    expect(result.current.checkedInTodayCreatedAt).toBe(
      "2026-07-13T10:00:00.000Z",
    );
  });

  it("returns hasCheckedInToday=false when the latest check-in is not today", async () => {
    vi.setSystemTime(new Date(2026, 6, 14, 15, 0, 0));

    const { result } = renderHook(() => useHasCheckedInToday(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasCheckedInToday).toBe(false);
    expect(result.current.checkedInTodayGymId).toBeNull();
    expect(result.current.checkedInTodayCreatedAt).toBeNull();
  });
});