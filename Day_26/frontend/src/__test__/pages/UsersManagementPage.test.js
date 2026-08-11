import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import UsersManagementPage from "../../pages/UsersManagementPage";
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

describe("UsersManagementPage", () => {
  test("renders user management page", async () => {
    const store = createTestStore();

    renderWithProviders(<UsersManagementPage />, {
      store,
      route: "/users",
    });

    expect(
      await screen.findByText(/user management/i)
    ).toBeInTheDocument();
  });
});