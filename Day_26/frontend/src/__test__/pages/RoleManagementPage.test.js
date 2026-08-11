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
  fetchRoles: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
}));

import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import RoleManagementPage from "../../pages/RoleManagementPage";
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