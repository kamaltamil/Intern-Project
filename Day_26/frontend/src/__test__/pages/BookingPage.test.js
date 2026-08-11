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
  fetchRooms: jest.fn(),
  fetchBookings: jest.fn(),
  createBooking: jest.fn(),
}));

import React from "react";
import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import BookingPage from "../../pages/BookingPage";
import authReducer from "../../store/slices/authSlice";
import bookingReducer from "../../store/slices/bookingSlice";

import {
  renderWithProviders,
} from "../utils/testUtils.jsx";

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      booking: bookingReducer,
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
      booking: {},
    },
  });

describe("BookingPage", () => {
  test("renders booking page", async () => {
    const store = createTestStore();

    renderWithProviders(<BookingPage />, {
      store,
      route: "/bookings",
    });

    expect(
      await screen.findByText(/booking/i)
    ).toBeInTheDocument();
  });
});