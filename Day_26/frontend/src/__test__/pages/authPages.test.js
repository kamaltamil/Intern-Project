import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import authReducer from "../../store/slices/authSlice";
import LoginPage from "../../pages/LoginPage";
import SignupPage from "../../pages/SignupPage";

jest.mock("../../api/queries", () => ({
  loginUser: jest.fn().mockResolvedValue({
    user: {
      _id: "1",
      name: "Kamal",
      email: "kamal@example.com",
      username: "kamal",
    },
    token: "test-token",
    refreshToken: "test-refresh-token",
    role: "Member",
    permissions: [],
  }),

  signupUser: jest.fn().mockResolvedValue({
    success: true,
    message: "Account created successfully",
  }),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        role: "Member",
        permissions: [],
        theme: "light",
        loading: false,
        error: null,
      },
    },
  });

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui, route = "/") => {
  const store = createTestStore();
  const queryClient = createTestQueryClient();

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("Authentication Pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login page", () => {
    renderWithProviders(<LoginPage />, "/login");

    expect(
      screen.getByRole("heading", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/welcome back to hotelpro dashboard/i)
    ).toBeInTheDocument();
  });

  test("renders login form fields", () => {
    renderWithProviders(<LoginPage />, "/login");

    expect(
      screen.getByPlaceholderText(/enter your email or username/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();
  });

  test("shows validation errors when login form is submitted empty", async () => {
    renderWithProviders(<LoginPage />, "/login");

    const submitButton = screen.getByRole("button", {
      name: /sign in/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/email or username is required/i)
      ).toBeInTheDocument();

      expect(
        screen.getByText(/password is required/i)
      ).toBeInTheDocument();
    });
  });

  test("submits login form", async () => {
    renderWithProviders(<LoginPage />, "/login");

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email or username/i),
      {
        target: {
          value: "kamal@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/enter your password/i),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/invalid credentials/i)
      ).not.toBeInTheDocument();
    });
  });

  test("renders signup page", () => {
    renderWithProviders(<SignupPage />, "/signup");

    expect(
      screen.getByRole("heading", {
        name: /create account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/join the hotelpro admin portal/i)
    ).toBeInTheDocument();
  });

  test("renders signup form fields", () => {
    renderWithProviders(<SignupPage />, "/signup");

    expect(
      screen.getByPlaceholderText(/enter your full name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/choose username/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/create password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign up/i,
      })
    ).toBeInTheDocument();
  });
});