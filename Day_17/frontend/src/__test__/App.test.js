// Setup DOM globals FIRST
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const React = require("react");
const { render } = require("@testing-library/react");

jest.mock("../routes/AppRoutes", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => React.createElement("div", { "data-testid": "app-routes" }, "AppRoutes"),
  };
});

const App = require("../App").default;

describe("App Component", () => {
  test("should render AppRoutes", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("app-routes")).toBeInTheDocument();
  });

  test("should render without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
