import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { getBookingColumns } from "../../../components/booking/BookingColumns";

const booking = {
  room:{roomNumber:101,type:"Single",price:100},
  startDate:"2026-08-10",endDate:"2026-08-12",
  roomStatus:"Available",bookingStatus:"Booked"
};

test("builds member columns and renders values", () => {
  const onView = jest.fn();
  const columns = getBookingColumns("Member", onView);
  expect(columns).toHaveLength(7);
  expect(columns[0].render(null)).toBe("—");
  render(<>{columns[0].render(booking.room)}</>);
  expect(screen.getByText("#101")).toBeInTheDocument();
  render(<>{columns[3].render(null, booking)}</>);
  expect(screen.getByText("2 nights")).toBeInTheDocument();
  render(<>{columns[4].render(null, booking)}</>);
  expect(screen.getByText("₹200")).toBeInTheDocument();
  render(<>{columns[5].render("Booked")}</>);
  expect(screen.getByText("Booked")).toBeInTheDocument();
  render(<>{columns[6].render(null, booking)}</>);
  fireEvent.click(screen.getByRole("button", {name:/view/i}));
  expect(onView).toHaveBeenCalledWith(booking);
});

test("builds staff columns and renders statuses", () => {
  const columns = getBookingColumns("Admin", jest.fn());
  expect(columns).toHaveLength(7);
  render(<>{columns[0].render(null)}</>);
  expect(screen.getByText("—")).toBeInTheDocument();
  render(<>{columns[0].render(booking.room)}</>);
  expect(screen.getByText("#101")).toBeInTheDocument();
  render(<>{columns[4].render("Available")}</>);
  expect(screen.getByText("Available")).toBeInTheDocument();
  render(<>{columns[5].render("Booked")}</>);
  expect(screen.getByText("Booked")).toBeInTheDocument();
});
