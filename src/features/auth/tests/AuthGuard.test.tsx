import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { server } from "@/test/msw/server";
import { AuthProvider } from "../AuthContext";
import { AuthGuard, PublicOnlyGuard } from "../AuthGuard";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter
          initialEntries={["/"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <div>Private</div>
                </AuthGuard>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyGuard>
                  <div>Public</div>
                </PublicOnlyGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("AuthGuard", () => {
  it("redirects unauthenticated users to login", async () => {
    server.use(
      http.patch("*/token/refresh", () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
    );

    render(<div />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/public/i)).toBeInTheDocument();
    });
  });
});
