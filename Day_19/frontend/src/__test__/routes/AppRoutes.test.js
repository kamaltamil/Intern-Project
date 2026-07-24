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
const { render, screen } = require("@testing-library/react");
const { Provider } = require("react-redux");
const configureMockStore = require("redux-mock-store");
const configureStore = configureMockStore.default || configureMockStore;
const { MemoryRouter } = require("react-router-dom");

jest.mock("antd", () => {
  const React = require("react");
  return {
    Layout: Object.assign(
      ({ children, style }) => React.createElement("div", null, children),
      {
        get Sider() { return ({ children }) => React.createElement("div", null, children); },
        get Header() { return ({ children }) => React.createElement("div", null, children); },
        get Content() { return ({ children }) => React.createElement("div", null, children); },
      }
    ),
    Menu: Object.assign(
      ({ children }) => React.createElement("div", null, children),
      {
        Item: ({ children, onClick }) =>
          React.createElement("div", { onClick }, children),
      }
    ),
    Button: ({ children, onClick, icon }) =>
      React.createElement("button", { onClick }, icon || children),
    Card: ({ children, title }) => {
      // title may be a JSX element like <Title>...</Title>, render it
      return React.createElement("div", null, [
        React.createElement("div", { key: "title" }, title),
        React.createElement("div", { key: "body" }, children),
      ]);
    },
    Form: Object.assign(
      ({ children }) => React.createElement("form", null, children),
      { Item: ({ children }) => React.createElement("div", null, children), useForm: () => [{}] }
    ),
    Input: Object.assign(
      React.forwardRef((props, ref) => React.createElement("input", { ...props, ref })),
      {
        Password: React.forwardRef((props, ref) => React.createElement("input", { ...props, ref })),
        Search: (props) => React.createElement("input", props),
      }
    ),
    Typography: { Title: ({ children, level, className }) => React.createElement(`h${level || 3}`, { className }, children) },
    Select: (props) => React.createElement("select", null),
    Alert: ({ message }) => React.createElement("div", null, message),
    Modal: ({ children }) => React.createElement("div", null, children),
    Popconfirm: ({ children }) => React.createElement("div", null, children),
    Space: ({ children }) => React.createElement("div", null, children),
    Spin: () => React.createElement("div", null, "Loading..."),
    Table: () => React.createElement("table", null),
    Tag: ({ children }) => React.createElement("span", null, children),
    notification: { success: jest.fn(), error: jest.fn() },
    Result: ({ title, subTitle, extra }) =>
      React.createElement("div", null, [
        React.createElement("div", { key: "t" }, title),
        React.createElement("div", { key: "s" }, subTitle),
        React.createElement("div", { key: "e" }, extra),
      ]),
    Descriptions: Object.assign(
      ({ children }) => React.createElement("div", null, children),
      { Item: ({ children }) => React.createElement("div", null, children) }
    ),
    Avatar: () => React.createElement("div", null),
    ConfigProvider: ({ children }) => React.createElement("div", null, children),
  };
});

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  return {
    MenuFoldOutlined: () => React.createElement("span"),
    MenuUnfoldOutlined: () => React.createElement("span"),
    ProfileOutlined: () => React.createElement("span"),
    CheckSquareOutlined: () => React.createElement("span"),
    UserOutlined: () => React.createElement("span"),
    LogoutOutlined: () => React.createElement("span"),
    DeleteOutlined: () => React.createElement("span"),
    EditOutlined: () => React.createElement("span"),
    SearchOutlined: () => React.createElement("span"),
  };
});

const mockStore = configureStore([]);

const AppRoutes = require("../../routes/AppRoutes").default;

const renderWithProviders = (route) => {
  const store = mockStore({
    auth: { user: null, token: null, refreshToken: null },
    tasks: { tasks: [], total: 0 },
    users: { users: [] },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  );
};

describe("AppRoutes", () => {
  test("should render login page at /login", async () => {
    renderWithProviders("/login");
    expect(await screen.findByText("Sign In")).toBeInTheDocument();
    expect(await screen.findByText("Create an account")).toBeInTheDocument();
  });

  test("should render register page at /register", async () => {
    renderWithProviders("/register");
    expect(await screen.findByText("Sign Up")).toBeInTheDocument();
    expect(await screen.findByText("Already have an account? Login")).toBeInTheDocument();
  });

  test("should render 404 page for unknown routes", async () => {
    renderWithProviders("/unknown-route");
    expect(await screen.findByText("404")).toBeInTheDocument();
  });

  test("should redirect / to /dashboard then to login", async () => {
    renderWithProviders("/");
    expect(await screen.findByText("Sign In")).toBeInTheDocument();
  });
});
