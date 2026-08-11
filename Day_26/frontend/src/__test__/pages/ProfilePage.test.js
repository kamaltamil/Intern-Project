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
    isError: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
  QueryClient: jest.fn(function() {
    this.defaultOptions = {};
    this.invalidateQueries = jest.fn();
  }),
}));

jest.mock("../../api/queries", () => ({
  fetchMe: jest.fn(() => Promise.resolve({})),
  updateUser: jest.fn(() => Promise.resolve({})),
}));

import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import ProfilePage from "../../pages/ProfilePage";
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