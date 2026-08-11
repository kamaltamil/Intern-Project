import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import RoleManagementPage from "../../pages/RoleManagementPage";
import authReducer from "../../store/slices/authSlice";

import {
  renderWithProviders,
} from "../utils/testUtils";

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          name: "Kamal",
          username: "kamal",
          email: "kamal@example.com",
          role: "Admin",
        },
        token: "test-token",
        refreshToken: null,
        role: "Admin",
        theme: "light",
        permissions: [],
        loading: false,
        error: null,
      },
    },
  });

describe("RoleManagementPage", () => {
  test("renders role management page", async () => {
    const store = createTestStore();

    renderWithProviders(<RoleManagementPage />, {
      store,
      route: "/roles",
    });

    expect(
      await screen.findByText(/role management/i)
    ).toBeInTheDocument();
  });
});