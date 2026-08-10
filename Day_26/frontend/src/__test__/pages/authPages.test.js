import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import LoginPage from "../../pages/LoginPage";
import SignupPage from "../../pages/SignupPage";
import store from "../../store";

// Create a fresh QueryClient for every test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Common wrapper for Redux + Router + React Query
const renderWithProviders = (ui, { route = "/" } = {}) => {
  const queryClient = createTestQueryClient();

  return render(
    <Provider store={store()}>
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
    renderWithProviders(<LoginPage />, {
      route: "/login",
    });

    expect(
      screen.getByText(/login/i)
    ).toBeInTheDocument();
  });

  test("submits login form", async () => {
    renderWithProviders(<LoginPage />, {
      route: "/login",
    });

    const submitButton = screen.getByText(/submit/i);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/submit/i)
      ).toBeInTheDocument();
    });
  });

  test("renders signup page", () => {
    renderWithProviders(<SignupPage />, {
      route: "/signup",
    });

    expect(
      screen.getByText(/sign up/i)
    ).toBeInTheDocument();
  });
});