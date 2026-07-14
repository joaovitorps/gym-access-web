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

  describe("success state", () => {
    it("renders a compact success state with Check icon and timestamp", async () => {
      render(
        <CheckInButton
          gym={gym}
          latitude={gym.latitude}
          longitude={gym.longitude}
        />,
        { wrapper },
      );

      await userEvent.click(
        screen.getByRole("button", { name: /check in/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/checked in/i)).toBeInTheDocument();
      });

      // No oversized uppercase "CHECKED IN" text
      expect(screen.queryByText(/^CHECKED IN$/)).not.toBeInTheDocument();
      // No oversized typography / padding classes
      expect(document.querySelector(".text-3xl")).toBeNull();
      expect(document.querySelector(".py-10")).toBeNull();
      // Renders the lucide Check icon (SVG with class containing "lucide-check")
      expect(
        document.querySelector('svg[class*="lucide-check"]'),
      ).toBeInTheDocument();
      // Still renders the formatted timestamp (e.g., "Jul 13")
      expect(screen.getByText(/Jul \d+/)).toBeInTheDocument();
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

  describe("already checked in today", () => {
    const otherGym: Gym = {
      id: "gym-2",
      title: "Other Gym",
      description: null,
      phone: null,
      latitude: -23.5220,
      longitude: -46.6720,
    };
    const todayTs = "2026-07-13T10:00:00.000Z";

    it("renders the compact Checked-in-here-today block (no CTA) when already checked in at this gym today", () => {
      render(
        <CheckInButton
          gym={gym}
          latitude={gym.latitude}
          longitude={gym.longitude}
          hasCheckedInToday
          checkedInTodayGymId={gym.id}
          checkedInTodayCreatedAt={todayTs}
        />,
        { wrapper },
      );

      expect(
        screen.getByText(/checked in here today/i),
      ).toBeInTheDocument();
      // No CTA button to fire a new check-in
      expect(
        screen.queryByRole("button", { name: /check in/i }),
      ).not.toBeInTheDocument();
      // Timestamp still rendered (formatDateTime yields "Jul 13")
      expect(screen.getByText(/Jul 13/)).toBeInTheDocument();
    });

    it("renders a disabled 'Already checked in today' button when checked in at a different gym today", () => {
      render(
        <CheckInButton
          gym={gym}
          latitude={gym.latitude}
          longitude={gym.longitude}
          hasCheckedInToday
          checkedInTodayGymId={otherGym.id}
          checkedInTodayCreatedAt={todayTs}
        />,
        { wrapper },
      );

      const button = screen.getByRole("button", {
        name: /already checked in today/i },
      );
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("disabled");
    });

    it("does not fire the check-in mutation when disabled as already checked in elsewhere today", async () => {
      render(
        <CheckInButton
          gym={gym}
          latitude={gym.latitude}
          longitude={gym.longitude}
          hasCheckedInToday
          checkedInTodayGymId={otherGym.id}
          checkedInTodayCreatedAt={todayTs}
        />,
        { wrapper },
      );

      const button = screen.getByRole("button", {
        name: /already checked in today/i },
      );
      // Disabled buttons should not dispatch a click; clicking should not
      // transition the UI into the success state.
      await userEvent.click(button);

      expect(
        screen.queryByText(/checked in here today/i),
      ).not.toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });
});
