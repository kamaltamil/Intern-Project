import React from "react";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import BookingCostPreview from "../../../components/booking/BookingCostPreview";

test("renders room cost preview", () => {
  render(<BookingCostPreview room={{price:200}} dateRange={[dayjs("2026-08-10"), dayjs("2026-08-13")]} />);
  expect(screen.getByText("₹200/day")).toBeInTheDocument();
  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getByText("₹600")).toBeInTheDocument();
});

test("renders nothing when room/date range is missing or invalid", () => {
  const { container } = render(<BookingCostPreview />);
  expect(container.firstChild).toBeNull();
  const { container: invalid } = render(<BookingCostPreview room={{price:200}} dateRange={[dayjs("2026-08-13"), dayjs("2026-08-10")]} />);
  expect(invalid.firstChild).toBeNull();
});
