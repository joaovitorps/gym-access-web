import { render, screen } from "@testing-library/react";
import { ErrorPage } from "../ErrorPage";

describe("ErrorPage", () => {
  it("renders gym-themed error message", () => {
    render(<ErrorPage />);

    expect(
      screen.getByText("This set didn't go as planned"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dropped the weights on this one/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rerack and retry/i }),
    ).toBeInTheDocument();
  });
});
