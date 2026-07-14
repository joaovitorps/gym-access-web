import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth/AuthContext";
import { GymsSearchPage } from "../GymsSearchPage";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {children}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("GymsSearchPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: -23.5216,
              longitude: -46.6712,
            },
          });
        }),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders search input", () => {
    act(() => {
      render(<GymsSearchPage />, { wrapper });
    });

    expect(screen.getByPlaceholderText(/search gyms/i)).toBeInTheDocument();
  });

  it("loads all gyms on mount", async () => {
    act(() => {
      render(<GymsSearchPage />, { wrapper });
    });

    await waitFor(() => {
      expect(screen.getByText("JS Gym")).toBeInTheDocument();
    });
    expect(screen.getByText("Iron Paradise")).toBeInTheDocument();
  });

  it("filters gyms as the user types", async () => {
    act(() => {
      render(<GymsSearchPage />, { wrapper });
    });

    await waitFor(() => {
      expect(screen.getByText("JS Gym")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/search gyms/i), "Iron");
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByText("JS Gym")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Iron Paradise")).toBeInTheDocument();
  });
});
