import React from "react";
import { render, screen } from "@testing-library/react";
import CustomCard from "../../components/CustomCard";

test("renders title, value and icon", () => {
  render(<CustomCard title="Users" value={12} icon={<span>icon</span>} />);
  expect(screen.getByText("Users")).toBeInTheDocument();
  expect(screen.getByText("12")).toBeInTheDocument();
  expect(screen.getByText("icon")).toBeInTheDocument();
});
