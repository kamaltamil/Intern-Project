import React from "react";
import { render, screen } from "@testing-library/react";
import BookingDetailsModal from "../../../components/booking/BookingDetailsModal";

const booking = {
  room:{roomNumber:101,type:"Single",price:100},
  user:{name:"Kamal",email:"kamal@example.com"},
  startDate:"2026-08-10",endDate:"2026-08-12",
  roomStatus:"Available",bookingStatus:"Booked"
};

test("renders no content without booking", () => {
  const { container } = render(<BookingDetailsModal open booking={null} role="Admin" onClose={jest.fn()} />);
  expect(container.firstChild).toBeNull();
});

test("renders details for staff role", () => {
  render(<BookingDetailsModal open booking={booking} role="Admin" onClose={jest.fn()} />);
  expect(screen.getByText("Booking Details")).toBeInTheDocument();
  expect(screen.getByText("Kamal")).toBeInTheDocument();
  expect(screen.getByText("kamal@example.com")).toBeInTheDocument();
  expect(screen.getByText("Room #101")).toBeInTheDocument();
  expect(screen.getByText("₹200")).toBeInTheDocument();
});

test("hides guest for member role", () => {
  render(<BookingDetailsModal open booking={booking} role="Member" onClose={jest.fn()} />);
  expect(screen.queryByText("kamal@example.com")).not.toBeInTheDocument();
});
