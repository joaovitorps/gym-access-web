import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/features/auth/AuthContext";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { CheckInHistoryList } from "../CheckInHistoryList";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function setUserRole(role: "ADMIN" | "MEMBER") {
  server.use(
    http.get("*/me", () => {
      return HttpResponse.json({
        user: {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
          role,
          created_at: "2026-07-13T21:47:02.453Z",
        },
      });
    }),
  );
}

describe("CheckInHistoryList", () => {
  it("loads member history from /check-ins/history", async () => {
    setUserRole("MEMBER");
    render(<CheckInHistoryList />, { wrapper });

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(
      screen.queryByText(/user-2/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /validate/i }),
    ).not.toBeInTheDocument();
  });

  it("loads all check-ins from /check-ins for admins", async () => {
    setUserRole("ADMIN");
    render(<CheckInHistoryList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/user-2/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/user-3/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /validate/i }),
    ).toHaveLength(1);
  });

  it("shows the validate button for pending admin check-ins", async () => {
    setUserRole("ADMIN");
    render(<CheckInHistoryList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /validate/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/validated/i),
    ).toBeInTheDocument();
  });
});
