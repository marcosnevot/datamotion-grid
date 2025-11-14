import { render, screen } from "@testing-library/react";
import App from "../../App";

describe("App", () => {
  it("renders main layout with data grid table", () => {
    render(<App />);

    // Main view title
    expect(
      screen.getByText(/Data grid playground/i),
    ).toBeInTheDocument();

    // Main data grid table
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });
});
