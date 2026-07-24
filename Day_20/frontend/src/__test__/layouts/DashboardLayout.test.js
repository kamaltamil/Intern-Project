// Setup DOM globals FIRST
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.MessageChannel === "undefined") {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { postMessage: () => {}, onmessage: null };
      this.port2 = {
        postMessage: () => {
          setTimeout(() => {
            if (this.port1.onmessage) this.port1.onmessage({});
          }, 0);
        },
        onmessage: null,
      };
    }
  };
}

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () {},
  };
};

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const React = require("react");
const { render, screen, fireEvent } = require("@testing-library/react");

jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

jest.mock("../../components/Sidebar", () => {
  return {
    __esModule: true,
    default: ({ collapsed }) => (
      <div data-testid="sidebar">{collapsed ? "collapsed" : "expanded"}</div>
    ),
  };
});

jest.mock("antd", () => {
  const React = require("react");
  return {
    Layout: Object.assign(
      ({ children, style }) =>
        React.createElement("div", { "data-testid": "layout", style }, children),
      {
        get Sider() {
          return ({ children, collapsed }) =>
            React.createElement(
              "div",
              { "data-testid": "sider", "data-collapsed": collapsed ? "true" : "false" },
              children
            );
        },
        get Header() {
          return ({ children, className }) =>
            React.createElement("div", { "data-testid": "header", className }, children);
        },
        get Content() {
          return ({ children, className }) =>
            React.createElement("div", { "data-testid": "content", className }, children);
        },
      }
    ),
    Button: ({ children, onClick, icon }) =>
      React.createElement("button", { onClick, "data-testid": "toggle-btn" }, icon || children),
  };
});

jest.mock("@ant-design/icons", () => ({
  MenuFoldOutlined: () => <span data-testid="fold-icon">Fold</span>,
  MenuUnfoldOutlined: () => <span data-testid="unfold-icon">Unfold</span>,
}));

const DashboardLayout = require("../../layouts/DashboardLayout").default;

describe("DashboardLayout", () => {
  test("should render sidebar and content", () => {
    render(<DashboardLayout />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.getByText("Task Manager")).toBeInTheDocument();
  });

  test("should start with sidebar expanded", () => {
    render(<DashboardLayout />);

    expect(screen.getByText("expanded")).toBeInTheDocument();
  });

  test("should toggle sidebar on button click", () => {
    render(<DashboardLayout />);

    const toggleBtn = screen.getByTestId("toggle-btn");
    fireEvent.click(toggleBtn);

    expect(screen.getByText("collapsed")).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText("expanded")).toBeInTheDocument();
  });

  test("should show fold icon when expanded", () => {
    render(<DashboardLayout />);
    expect(screen.getByTestId("fold-icon")).toBeInTheDocument();
  });

  test("should show unfold icon when collapsed", () => {
    render(<DashboardLayout />);
    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("unfold-icon")).toBeInTheDocument();
  });
});
