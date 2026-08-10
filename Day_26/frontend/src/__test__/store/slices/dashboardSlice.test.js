import reducer, { startDashboardLoading, setDashboardData, setDashboardError } from "../../../store/slices/dashboardSlice";

test("handles dashboard loading and data", () => {
  let state = reducer(undefined, startDashboardLoading());
  expect(state.loading).toBe(true);
  state = reducer(state, setDashboardData({ stats: [1], bookings: [2], users: [3] }));
  expect(state).toMatchObject({ stats: [1], bookings: [2], users: [3], loading: false, error: null });
  state = reducer(state, setDashboardData());
  expect(state).toMatchObject({ stats: [], bookings: [], users: [] });
});

test("handles dashboard error", () => {
  expect(reducer(undefined, setDashboardError("x"))).toMatchObject({ loading: false, error: "x" });
});
