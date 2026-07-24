// Setup DOM globals FIRST to bypass Babel import hoisting issues
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
const { render, screen, fireEvent, waitFor } = require("@testing-library/react");

let mockUser = null;
let mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({ auth: { user: mockUser } }),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

jest.mock("../../store/authSlice", () => ({
  login: jest.fn((payload) => ({
    type: "auth/login",
    payload,
  })),
}));

jest.mock("../../api/authApi", () => ({
  loginUser: jest.fn(),
}));

jest.mock("antd", () => {
  const React = require("react");
  return {
    Button: ({ children, onClick, loading, ...rest }) =>
      React.createElement("button", { onClick, disabled: loading, ...rest }, children),
    Card: ({ children, title }) =>
      React.createElement("div", { "data-testid": "card" }, [
        React.createElement("div", { key: "title" }, typeof title === "string" ? title : title),
        React.createElement("div", { key: "body" }, children),
      ]),
    Form: Object.assign(
      ({ children, onFinish, layout }) => {
        const handleSubmit = (e) => {
          e.preventDefault();
          // Collect form values from the rendered inputs
          const formData = {};
          const inputs = e.target.querySelectorAll("input");
          inputs.forEach((input) => {
            if (input.name) formData[input.name] = input.value;
          });
          if (onFinish) onFinish(formData);
        };
        return React.createElement("form", { onSubmit: handleSubmit }, children);
      },
      {
        Item: ({ children, label, name, rules }) =>
          React.createElement("div", null, [
            React.createElement("label", { key: "label", htmlFor: name }, label),
            React.createElement("div", { key: "input" },
              React.Children.map(children, (child) =>
                child ? React.cloneElement(child, { name, id: name }) : null
              )
            ),
          ]),
      }
    ),
    Input: Object.assign(
      React.forwardRef(({ name, id, ...rest }, ref) =>
        React.createElement("input", { name, id, ref, ...rest })
      ),
      {
        Password: React.forwardRef(({ name, id, ...rest }, ref) =>
          React.createElement("input", { type: "password", name, id, ref, ...rest })
        ),
      }
    ),
    Typography: {
      Title: ({ children, level }) =>
        React.createElement(`h${level || 1}`, null, children),
    },
    Alert: ({ message, type }) =>
      React.createElement("div", { role: "alert", "data-type": type }, message),
  };
});

const Login = require("../../pages/Login").default;
const { loginUser } = require("../../api/authApi");
const { login } = require("../../store/authSlice");

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockDispatch = jest.fn();
  });

  test("should redirect to /dashboard/tasks when user is already logged in", () => {
    mockUser = { name: "Kamal", role: "Admin" };
    render(<Login />);

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByText("/dashboard/tasks")).toBeInTheDocument();
  });

  test("should render login form when user is not logged in", () => {
    render(<Login />);

    expect(screen.getByText("Task Manager Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Email or Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Create an account")).toBeInTheDocument();
  });

  test("should call loginUser and dispatch login on successful submit", async () => {
    loginUser.mockResolvedValue({
      user: { name: "Kamal" },
      token: "tok",
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email or Username"), {
      target: { value: "kamal@gmail.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign In").closest("form"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("kamal@gmail.com", "123456");
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks");
    });
  });

  test("should display error message on login failure", async () => {
    loginUser.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email or Username"), {
      target: { value: "wrong@gmail.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign In").closest("form"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("should display error.message when no response data", async () => {
    loginUser.mockRejectedValue(new Error("Network Error"));

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email or Username"), {
      target: { value: "test@g.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign In").closest("form"));

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });
});
