import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/slices/authSlice";
import { useLoadRolePermissions } from "../../utils/useLoadRolePermissions";
import * as queries from "../../api/queries";

jest.mock("../../api/queries", () => ({
  fetchRoleByName: jest.fn(),
}));

const makeStore = (auth) => configureStore({ reducer: { auth: authReducer }, preloadedState: { auth } });
const wrapperFor = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;

const baseAuth = {
  user: null, token: "t", refreshToken: "r", role: "Manager",
  permissions: [], theme: "light", loading: false, error: null,
};

test("loads role permissions", async () => {
  queries.fetchRoleByName.mockResolvedValue({ permissions: [{ resource: "users", action: { view: true } }] });
  const store = makeStore(baseAuth);
  renderHook(() => useLoadRolePermissions(), { wrapper: wrapperFor(store) });
  await waitFor(() => expect(store.getState().auth.permissions).toEqual([{ resource: "users", action: { view: true } }]));
});

test("handles missing token without fetching", () => {
  const store = makeStore({ ...baseAuth, token: null });
  renderHook(() => useLoadRolePermissions(), { wrapper: wrapperFor(store) });
  expect(queries.fetchRoleByName).not.toHaveBeenCalled();
});

test("handles API failure", async () => {
  queries.fetchRoleByName.mockRejectedValue(new Error("network"));
  const store = makeStore(baseAuth);
  renderHook(() => useLoadRolePermissions(), { wrapper: wrapperFor(store) });
  await waitFor(() => expect(store.getState().auth.permissions).toEqual([]));
});

test("does not fetch the same role twice", async () => {
  queries.fetchRoleByName.mockResolvedValue({ permissions: [] });
  const store = makeStore(baseAuth);
  const { rerender } = renderHook(() => useLoadRolePermissions(), { wrapper: wrapperFor(store) });
  await waitFor(() => expect(queries.fetchRoleByName).toHaveBeenCalledTimes(1));
  rerender();
  expect(queries.fetchRoleByName).toHaveBeenCalledTimes(1);
});
