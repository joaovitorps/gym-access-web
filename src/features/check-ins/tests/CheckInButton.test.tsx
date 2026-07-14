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

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("CheckInButton", () => {
  it("renders check-in button and detects proximity", () => {
    render(
      <CheckInButton
        gym={gym}
        latitude={gym.latitude}
        longitude={gym.longitude}
      />,
      { wrapper },
    );

    expect(
      screen.getByRole("button", { name: /check in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/0 m away/i)).toBeInTheDocument();
  });

  it("checks in successfully when within range", async () => {
    render(
      <CheckInButton
        gym={gym}
        latitude={gym.latitude}
        longitude={gym.longitude}
      />,
      { wrapper },
    );

    await userEvent.click(screen.getByRole("button", { name: /check in/i }));

    await waitFor(() => {
      expect(screen.getByText(/checked in/i)).toBeInTheDocument();
    });
  });

  it("is disabled while locating", () => {
    render(
      <CheckInButton
        gym={gym}
        latitude={null}
        longitude={null}
        isLocating
      />,
      { wrapper },
    );

    expect(screen.getByRole("button", { name: /getting location/i })).toBeDisabled();
  });

  it("allows manual entry when geolocation is unavailable", async () => {
    render(
      <CheckInButton gym={gym} latitude={null} longitude={null} />,
      { wrapper },
    );

    expect(screen.getByRole("button", { name: /enter location manually/i })).toBeEnabled();
  });
});
