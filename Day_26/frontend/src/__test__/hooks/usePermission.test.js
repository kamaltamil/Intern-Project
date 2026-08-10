import React from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import usePermission from "../../hooks/usePermission";
import authReducer from "../../store/slices/authSlice";

const wrapper = ({ children }) => (
  <Provider store={configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null, token: null, refreshToken: null, role: "Manager",
        permissions: [{ resource: "users", action: { view: true, create: true, update: false, delete: true } }],
        theme: "light", loading: false, error: null,
      },
    },
  })}>{children}</Provider>
);

test("returns CRUD helpers", () => {
  const { result } = renderHook(() => usePermission("users"), { wrapper });
  expect(result.current.canView).toBe(true);
  expect(result.current.canCreate).toBe(true);
  expect(result.current.canUpdate).toBe(false);
  expect(result.current.canDelete).toBe(true);
});

test("returns boolean for single action", () => {
  const { result } = renderHook(() => usePermission("users", "create"), { wrapper });
  expect(result.current).toBe(true);
});
