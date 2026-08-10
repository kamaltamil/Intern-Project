import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

jest.mock("../routes/AppRoutes", () => () => <div>Application Routes</div>);

test("renders the application routes", () => {
  render(<App />);
  expect(screen.getByText("Application Routes")).toBeInTheDocument();
});
