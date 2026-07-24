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
const { render, screen, fireEvent, waitFor, act } = require("@testing-library/react");

let mockUser = { _id: "u1", name: "Kamal", role: "Admin" };
let mockToken = "fake-token";
let mockUsers = [];
let mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      auth: { user: mockUser, token: mockToken },
      users: { users: mockUsers },
    }),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../store/userSlice", () => ({
  setUsersData: jest.fn((data) => ({
    type: "users/setUsersData",
    payload: data,
  })),
}));

const mockGetUsers = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock("../../api/authApi", () => ({
  getUsers: (...args) => mockGetUsers(...args),
  updateUser: (...args) => mockUpdateUser(...args),
  deleteUser: (...args) => mockDeleteUser(...args),
}));

jest.mock("antd", () => {
  const React = require("react");
  return {
    Alert: ({ message }) =>
      React.createElement("div", { role: "alert" }, message),
    Button: ({ children, onClick, danger, icon, type }) =>
      React.createElement("button", { onClick, "data-danger": danger ? "true" : undefined }, children),
    Card: ({ children, title }) =>
      React.createElement("div", { "data-testid": "card" }, [
        React.createElement("div", { key: "title" }, title),
        React.createElement("div", { key: "body" }, children),
      ]),
    Input: React.forwardRef(({ placeholder, value, onChange, style, ...rest }, ref) =>
      React.createElement("input", {
        placeholder,
        value,
        onChange,
        ref,
        "data-testid": `input-${(placeholder || "").toLowerCase().replace(/\s/g, "-")}`,
        ...rest,
      })
    ),
    Modal: ({ children, title, open, onCancel, onOk, okText }) =>
      open
        ? React.createElement("div", { "data-testid": "modal" }, [
            React.createElement("div", { key: "title" }, title),
            React.createElement("div", { key: "body" }, children),
            React.createElement("button", { key: "ok", onClick: onOk, "data-testid": "modal-ok" }, okText || "OK"),
            React.createElement("button", { key: "cancel", onClick: onCancel, "data-testid": "modal-cancel" }, "Cancel"),
          ])
        : null,
    Popconfirm: ({ children, onConfirm, title }) =>
      React.createElement("div", null, [
        React.createElement("div", { key: "children" }, children),
        React.createElement("button", { key: "confirm", onClick: onConfirm, "data-testid": "confirm-delete" }, "Confirm"),
      ]),
    Space: ({ children }) =>
      React.createElement("div", null, children),
    Spin: ({ size }) =>
      React.createElement("div", { "data-testid": "spinner" }, "Loading..."),
    Table: ({ dataSource, columns, rowKey }) =>
      React.createElement("table", { "data-testid": "users-table" }, [
        React.createElement(
          "tbody",
          { key: "body" },
          (dataSource || []).map((row, i) =>
            React.createElement("tr", { key: row[rowKey] || i },
              columns.map((col) =>
                React.createElement("td", { key: col.key || col.dataIndex },
                  col.render
                    ? col.render(row[col.dataIndex], row)
                    : row[col.dataIndex]
                )
              )
            )
          )
        ),
      ]),
    Tag: ({ children, color }) =>
      React.createElement("span", { "data-color": color }, children),
  };
});

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  return {
    DeleteOutlined: () => React.createElement("span"),
    EditOutlined: () => React.createElement("span"),
  };
});

const Users = require("../../pages/Users").default;

describe("Users Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { _id: "u1", name: "Kamal", role: "Admin" };
    mockToken = "fake-token";
    mockUsers = [];
    mockDispatch = jest.fn();
    mockGetUsers.mockResolvedValue({ data: [] });
  });

  test("should show loading spinner initially", async () => {
    mockGetUsers.mockReturnValue(new Promise(() => {}));

    await act(async () => {
      render(<Users />);
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("should fetch and display users", async () => {
    mockUsers = [
      { _id: "u1", name: "Kamal", email: "k@g.com", role: "Admin" },
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalled();
    });
  });

  test("should open edit modal when Edit is clicked", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const editBtn = screen.getByText("Edit");
    await act(async () => {
      fireEvent.click(editBtn);
    });

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Edit User")).toBeInTheDocument();
  });

  test("should update user when Save is clicked", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });
    mockUpdateUser.mockResolvedValue({ success: true });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "Updated" } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("modal-ok"));
    });

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
    });
  });

  test("should handle update user error", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });
    mockUpdateUser.mockRejectedValue(new Error("Update failed"));

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    await act(async () => {
      fireEvent.click(screen.getByTestId("modal-ok"));
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("should close edit modal on cancel", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-cancel"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("should delete user on confirm", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });
    mockDeleteUser.mockResolvedValue({ success: true });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-delete"));
    });

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith("u2");
    });
  });

  test("should handle delete user error", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });
    mockDeleteUser.mockRejectedValue(new Error("Delete failed"));

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-delete"));
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("should handle fetch users error", async () => {
    mockGetUsers.mockRejectedValue(new Error("Fetch failed"));

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("should render role tags with correct colors", async () => {
    mockUsers = [
      { _id: "u1", name: "Admin User", email: "a@g.com", role: "Admin" },
      { _id: "u2", name: "Member User", email: "m@g.com", role: "Member" },
      { _id: "u3", name: "Other User", email: "o@g.com", role: "User" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  test("should update email input in edit modal", async () => {
    mockUsers = [
      { _id: "u2", name: "Tamil", email: "t@g.com", role: "Member" },
    ];
    mockGetUsers.mockResolvedValue({ data: mockUsers });

    await act(async () => {
      render(<Users />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const emailInput = screen.getByTestId("input-email");
    fireEvent.change(emailInput, { target: { value: "new@g.com" } });

    expect(emailInput.value).toBe("new@g.com");
  });
});
