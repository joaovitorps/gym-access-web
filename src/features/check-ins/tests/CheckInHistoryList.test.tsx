import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { CheckInHistoryList } from "../CheckInHistoryList";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ user: { role: "MEMBER", name: "Alice" } }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CheckInHistoryList", () => {
  it("renders gym titles for each check-in", async () => {
    renderWithQuery(<CheckInHistoryList />);

    expect(await screen.findByText("JS Gym")).toBeInTheDocument();
  });
});
