import { formatDate, getNights, getTotalCost, getPageTitle, bookingStatusConfig, roomTypeColor, roomStatusColor } from "../../../components/booking/BookingHelpers";

test("formats dates and handles missing dates", () => {
  expect(formatDate("2026-08-10")).toBe("10 Aug 2026");
  expect(formatDate()).toBe("—");
});

test("calculates nights including singular/plural", () => {
  expect(getNights("2026-08-10", "2026-08-11")).toBe("1 night");
  expect(getNights("2026-08-10", "2026-08-12")).toBe("2 nights");
  expect(getNights("2026-08-10", "2026-08-10")).toBe("0 nights");
});

test("calculates total cost and handles invalid booking", () => {
  expect(getTotalCost({ room:{price:100}, startDate:"2026-08-10", endDate:"2026-08-13" })).toBe(300);
  expect(getTotalCost({})).toBe(0);
  expect(getTotalCost({ room:{price:0}, startDate:"x", endDate:"y" })).toBe(0);
});

test("returns page titles by role", () => {
  expect(getPageTitle("Admin")).toBe("All Bookings");
  expect(getPageTitle("Manager")).toBe("Member Bookings");
  expect(getPageTitle("Member")).toBe("My Bookings");
  expect(Object.keys(bookingStatusConfig)).toHaveLength(5);
  expect(roomTypeColor.Suite).toBe("purple");
  expect(roomStatusColor.Maintenance).toBe("orange");
});
