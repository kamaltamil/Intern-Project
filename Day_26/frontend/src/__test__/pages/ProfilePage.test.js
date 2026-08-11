import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import ProfilePage from "../../pages/ProfilePage";
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
          _id: "user-1",
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

describe("ProfilePage", () => {
  test("renders profile page", async () => {
    const store = createTestStore();

    renderWithProviders(<ProfilePage />, {
      store,
      route: "/profile",
    });

    expect(
      await screen.findByText(/profile/i)
    ).toBeInTheDocument();
  });
});