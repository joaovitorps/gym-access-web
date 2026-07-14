import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { CheckInHistoryList } from "../CheckInHistoryList";

let currentRole: "ADMIN" | "MEMBER" = "MEMBER";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: { role: currentRole, name: "Alice" } }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("CheckInHistoryList", () => {
  it("renders gym titles for each check-in", async () => {
    currentRole = "MEMBER";
    renderWithQuery(<CheckInHistoryList />);

    expect(await screen.findByText("JS Gym")).toBeInTheDocument();
    expect(screen.getByText("Iron Paradise")).toBeInTheDocument();
  });

  it("does not show validate button or user ids for members", async () => {
    currentRole = "MEMBER";
    renderWithQuery(<CheckInHistoryList />);

    await waitFor(() => {
      expect(screen.getByText("JS Gym")).toBeInTheDocument();
    });

    expect(screen.queryByText(/user-2/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /validate/i }),
    ).not.toBeInTheDocument();
  });

  it("loads all check-ins from /check-ins for admins", async () => {
    currentRole = "ADMIN";
    renderWithQuery(<CheckInHistoryList />);

    await waitFor(() => {
      expect(screen.getByText(/user-2/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/user-3/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /validate/i }),
    ).toHaveLength(1);
  });

  it("shows the validate button for pending admin check-ins", async () => {
    currentRole = "ADMIN";
    renderWithQuery(<CheckInHistoryList />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /validate/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/validated/i)).toBeInTheDocument();
  });
});
