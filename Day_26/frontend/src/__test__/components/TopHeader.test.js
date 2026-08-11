jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    data: null,
  })),
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock("../../api/queries", () => ({
  logoutUser: jest.fn(() => Promise.resolve({})),
}));

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
} from "../utils/testUtils.jsx";

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