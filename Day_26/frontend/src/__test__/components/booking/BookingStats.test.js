import React from "react";
import { render } from "@testing-library/react";
import BookingStats from "../../../components/booking/BookingStats";

test("calculates total active pending and cancelled statistics", () => {
  const stats = BookingStats([
    { bookingStatus:"Booked" },
    { bookingStatus:"CheckedIn" },
    { bookingStatus:"Payment Pending" },
    { bookingStatus:"Cancelled" },
    { bookingStatus:"CheckedOut" },
  ]);
  expect(stats.map(s => s.value)).toEqual([5,2,1,1]);
});

test("supports default empty bookings", () => {
  expect(BookingStats()).toHaveLength(4);
  expect(BookingStats()[0].value).toBe(0);
});
