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
  registerUser: jest.fn(),
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

const Register = require("../../pages/Register").default;
const { registerUser } = require("../../api/authApi");
const { login } = require("../../store/authSlice");

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockDispatch = jest.fn();
  });

  test("should redirect to /dashboard/tasks when user is already logged in", () => {
    mockUser = { name: "Kamal", role: "Admin" };
    render(<Register />);

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByText("/dashboard/tasks")).toBeInTheDocument();
  });

  test("should render registration form when user is not logged in", () => {
    render(<Register />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Already have an account? Login")).toBeInTheDocument();
  });

  test("should call registerUser and dispatch login on successful submit", async () => {
    registerUser.mockResolvedValue({
      user: { name: "Kamal" },
      token: "tok",
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Kamal", name: "name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "kamal@gmail.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign Up").closest("form"));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith("Kamal", "kamal@gmail.com", "123456");
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tasks");
    });
  });

  test("should display error message on registration failure", async () => {
    registerUser.mockRejectedValue({
      response: { data: { message: "User already exists" } },
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Kamal", name: "name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "kamal@gmail.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign Up").closest("form"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });

  test("should display error.message when no response data", async () => {
    registerUser.mockRejectedValue(new Error("Network Error"));

    render(<Register />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test", name: "name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "t@g.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456", name: "password" },
    });

    fireEvent.submit(screen.getByText("Sign Up").closest("form"));

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });
});
