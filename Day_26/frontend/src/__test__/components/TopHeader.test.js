import React from "react";
import {
  screen,
  fireEvent,
} from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import TopHeader from "../../components/TopHeader";
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
        refreshToken: "refresh-token",
        role: "Admin",
        theme: "light",
        permissions: [],
        loading: false,
        error: null,
      },
    },
  });

describe("TopHeader", () => {
  test("renders user and toggles theme", async () => {
    const store = createTestStore();

    renderWithProviders(<TopHeader />, {
      store,
      route: "/",
    });

    expect(
      await screen.findByText(/Kamal/i)
    ).toBeInTheDocument();
  });

  test("shows dropdown actions and handles logout", async () => {
    const store = createTestStore();

    renderWithProviders(<TopHeader />, {
      store,
      route: "/",
    });

    const userElement = await screen.findByText(/Kamal/i);

    fireEvent.click(userElement);

    expect(
      await screen.findByText(/logout/i)
    ).toBeInTheDocument();
  });
});