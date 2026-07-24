// Setup DOM globals FIRST
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const React = require("react");
const { render, screen } = require("@testing-library/react");

let mockUser = null;

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ auth: { user: mockUser } }),
}));

jest.mock("antd", () => {
  const React = require("react");
  return {
    Card: ({ children }) =>
      React.createElement("div", { "data-testid": "card" }, children),
    Descriptions: Object.assign(
      ({ children, bordered, column }) =>
        React.createElement("dl", { "data-testid": "descriptions" }, children),
      {
        Item: ({ children, label }) =>
          React.createElement("div", null, [
            React.createElement("dt", { key: "l" }, label),
            React.createElement("dd", { key: "v" }, children),
          ]),
      }
    ),
    Avatar: ({ icon }) =>
      React.createElement("div", { "data-testid": "avatar" }, icon),
    Typography: {
      Title: ({ children }) =>
        React.createElement("h3", null, children),
    },
  };
});

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  return {
    UserOutlined: () =>
      React.createElement("span", { "data-testid": "user-icon" }),
  };
});

const Profile = require("../../pages/Profile").default;

describe("Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  test("should render user profile with name and email", () => {
    mockUser = { name: "Kamal", email: "kamal@gmail.com" };
    render(<Profile />);

    const nameElements = screen.getAllByText("Kamal");
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("kamal@gmail.com")).toBeInTheDocument();
  });

  test("should render profile card", () => {
    mockUser = { name: "Test", email: "test@g.com" };
    render(<Profile />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  test("should handle null user gracefully", () => {
    mockUser = null;
    render(<Profile />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });
});
