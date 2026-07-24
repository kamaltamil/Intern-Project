// Setup DOM globals FIRST
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const React = require("react");
const { render, screen } = require("@testing-library/react");

jest.mock("react-router-dom", () => {
  const React = require("react");
  return {
    Link: ({ to, children }) => React.createElement("a", { href: to }, children),
  };
});

jest.mock("antd", () => {
  const React = require("react");
  return {
    Button: ({ children }) =>
      React.createElement("button", null, children),
    Result: ({ status, title, subTitle, extra }) =>
      React.createElement("div", { "data-testid": "result" }, [
        React.createElement("div", { key: "status", "data-testid": "status" }, status),
        React.createElement("h3", { key: "title" }, title),
        React.createElement("p", { key: "sub" }, subTitle),
        React.createElement("div", { key: "extra" }, extra),
      ]),
  };
});

const NotFound = require("../../pages/NotFound").default;

describe("NotFound Page", () => {
  test("should render 404 status", () => {
    render(<NotFound />);
    // status and title both render "404", so use getAllByText
    const elements = screen.getAllByText("404");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  test("should render the sorry message", () => {
    render(<NotFound />);
    expect(
      screen.getByText("Sorry, the page you requested does not exist.")
    ).toBeInTheDocument();
  });

  test("should render Back to Dashboard button", () => {
    render(<NotFound />);
    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  test("should have a link to /dashboard", () => {
    render(<NotFound />);
    const link = screen.getByText("Back to Dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/dashboard");
  });
});
