import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../AuthContext";
import { LoginPage } from "../LoginPage";
import { DashboardPage } from "@/app/DashboardPage";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={children} />
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("LoginPage", () => {
  it("renders the login form", () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 6 characters/i),
    ).toBeInTheDocument();
  });

  it("shows a form-level error for invalid credentials", async () => {
    render(<LoginPage />, { wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument();
  });

  it("navigates to dashboard on successful login", async () => {
    render(<LoginPage />, { wrapper });

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "alice@example.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
