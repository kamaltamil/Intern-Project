import reducer, { setRooms, setBookings, startBookingLoading, setBookingError } from "../../../store/slices/bookingSlice";

test("handles rooms", () => {
  let state = reducer(undefined, setRooms([{ _id: "r" }]));
  expect(state.rooms).toHaveLength(1);
  state = reducer(state, setRooms("bad"));
  expect(state.rooms).toEqual([]);
});

test("handles bookings", () => {
  let state = reducer(undefined, setBookings([{ _id: "b" }]));
  expect(state.bookings).toHaveLength(1);
  state = reducer(state, setBookings(null));
  expect(state.bookings).toEqual([]);
});

test("handles loading and errors", () => {
  let state = reducer(undefined, startBookingLoading());
  expect(state.loading).toBe(true);
  state = reducer(state, setBookingError("failed"));
  expect(state).toMatchObject({ loading: false, error: "failed" });
});
