import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "../NotFoundPage";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter
      initialEntries={["/not-a-real-page"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NotFoundPage", () => {
  it("renders gym-themed 404 message", () => {
    render(<NotFoundPage />, { wrapper });

    expect(screen.getByText("This rack is empty")).toBeInTheDocument();
    expect(
      screen.getByText(/wandered into the cardio section/i),
    ).toBeInTheDocument();
  });

  it("navigates home when clicking the button", async () => {
    render(<NotFoundPage />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: /head back/i }));

    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
