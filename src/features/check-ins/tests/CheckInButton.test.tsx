import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CheckInButton } from "../CheckInButton";
import type { Gym } from "@/features/gyms/api";

const gym: Gym = {
  id: "gym-1",
  title: "JS Gym",
  description: null,
  phone: null,
  latitude: -23.521609,
  longitude: -46.671253,
};

const mockGetCurrentPosition = vi.fn();

Object.defineProperty(global.navigator, "geolocation", {
  value: {
    getCurrentPosition: mockGetCurrentPosition,
  },
  writable: true,
});

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("CheckInButton", () => {
  beforeEach(() => {
    mockGetCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: gym.latitude,
          longitude: gym.longitude,
        },
      });
    });
  });

  afterEach(() => {
    mockGetCurrentPosition.mockReset();
  });

  it("renders check-in button and detects proximity", async () => {
    render(<CheckInButton gym={gym} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /check in/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/0 m away/i)).toBeInTheDocument();
  });

  it("checks in successfully when within range", async () => {
    render(<CheckInButton gym={gym} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /check in/i }),
      ).not.toBeDisabled();
    });

    await userEvent.click(screen.getByRole("button", { name: /check in/i }));

    await waitFor(() => {
      expect(screen.getByText(/checked in/i)).toBeInTheDocument();
    });
  });
});
