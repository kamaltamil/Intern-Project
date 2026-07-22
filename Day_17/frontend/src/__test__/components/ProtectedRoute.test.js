// Setup DOM globals FIRST to bypass Babel import hoisting issues
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Safely require modules
const React = require("react");
const { render, screen } = require("@testing-library/react");
const { Provider } = require("react-redux");
const configureMockStore = require("redux-mock-store");
const configureStore = configureMockStore.default || configureMockStore;
const ProtectedRoute = require("../../components/ProtectedRoute").default;

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  useLocation: () => ({ pathname: "/test-path" }),
}));

const mockStore = configureStore([]);

describe("ProtectedRoute Component", () => {
  const renderWithRedux = (ui, initialState) => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        {ui}
      </Provider>
    );
  };

  test("redirects to login when user is not authenticated", () => {
    renderWithRedux(
      <ProtectedRoute allowedRoles={["Admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { auth: { user: null } }
    );

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByText("/login")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("redirects to /dashboard/tasks when user lacks allowed roles", () => {
    renderWithRedux(
      <ProtectedRoute allowedRoles={["Admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { auth: { user: { role: "User" } } }
    );

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByText("/dashboard/tasks")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("renders children when user is authenticated and has allowed role", () => {
    renderWithRedux(
      <ProtectedRoute allowedRoles={["Admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { auth: { user: { role: "Admin" } } }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  test("renders children when no specific allowedRoles are provided", () => {
    renderWithRedux(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { auth: { user: { role: "User" } } }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});