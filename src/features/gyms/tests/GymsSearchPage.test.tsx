import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
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
  it("renders search form", () => {
    render(<GymsSearchPage />, { wrapper });

    expect(screen.getByPlaceholderText(/search gyms/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("shows validation error when searching empty query", async () => {
    render(<GymsSearchPage />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByText(/search term is required/i)).toBeInTheDocument();
  });

  it("renders gym cards after searching", async () => {
    render(<GymsSearchPage />, { wrapper });

    await userEvent.type(screen.getByPlaceholderText(/search gyms/i), "JS");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("JS Gym")).toBeInTheDocument();
    });
  });
});
