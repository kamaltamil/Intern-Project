jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
    data: null,
  })),
  useQuery: jest.fn(() => ({
    data: [],
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
  fetchUsers: jest.fn(),
  fetchRoles: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import UsersManagementPage from "../../pages/UsersManagementPage";
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