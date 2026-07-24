// Setup DOM globals FIRST to bypass Babel import hoisting issues
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Safely require modules
const React = require("react");
const { render, screen, fireEvent } = require("@testing-library/react");
const Sidebar = require("../../components/Sidebar").default;
const { logout } = require("../../store/authSlice");

const mockNavigate = jest.fn();
let mockUser = null;
let mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({ auth: { user: mockUser } }),
}));

jest.mock("react-router-dom", () => ({
  NavLink: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Menu = Object.assign(
    ({ children }) =>
      React.createElement("div", { "data-testid": "menu" }, children),
    {
      Item: ({ children, onClick }) =>
        React.createElement("div", { onClick }, children),
    },
  );

  return { Menu };
});

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  return {
    ProfileOutlined: () =>
      React.createElement("span", { "data-testid": "profile-icon" }),
    CheckSquareOutlined: () =>
      React.createElement("span", { "data-testid": "tasks-icon" }),
    UserOutlined: () =>
      React.createElement("span", { "data-testid": "users-icon" }),
    LogoutOutlined: () =>
      React.createElement("span", { "data-testid": "logout-icon" }),
  };
});

jest.mock("../../store/authSlice", () => ({
  logout: jest.fn(() => ({ type: "auth/logout" })),
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockUser = null;
  });

  const renderSidebar = (user, collapsed = false) => {
    mockUser = user;

    return render(<Sidebar collapsed={collapsed} />);
  };

  test("should render standard menu items for a regular user", () => {
    renderSidebar({ role: "User" });

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();

    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  test("should render 'Users' menu item for Admin users", () => {
    renderSidebar({ role: "Admin" });

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("should display collapsed logo text when collapsed prop is true", () => {
    renderSidebar({ role: "User" }, true);

    expect(screen.getByText("TM")).toBeInTheDocument();
    expect(screen.queryByText("Task Manager")).not.toBeInTheDocument();
  });

  test("should display full logo text when collapsed prop is false", () => {
    renderSidebar({ role: "User" }, false);

    expect(screen.getByText("Task Manager")).toBeInTheDocument();
    expect(screen.queryByText("TM")).not.toBeInTheDocument();
  });

  test("should dispatch logout and navigate to /login when logout is clicked", () => {
    renderSidebar({ role: "User" }, false);

    const logoutMenu = screen.getByText("Logout");
    fireEvent.click(logoutMenu);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
