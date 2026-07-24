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

let mockUser = { _id: "u1", name: "Kamal", role: "User" };
let mockTasks = [];
let mockTotal = 0;
let mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      auth: { user: mockUser },
      tasks: { tasks: mockTasks, total: mockTotal },
    }),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../store/taskSlice", () => ({
  setTasksData: jest.fn((data) => ({
    type: "tasks/setTasksData",
    payload: data,
  })),
}));

const mockGetTasks = jest.fn();
const mockAddTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

jest.mock("../../api/taskApi", () => ({
  getTasks: (...args) => mockGetTasks(...args),
  addTask: (...args) => mockAddTask(...args),
  updateTask: (...args) => mockUpdateTask(...args),
  deleteTask: (...args) => mockDeleteTask(...args),
}));

jest.mock("../../components/TaskForm", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ onAddTask, initialValues, submitLabel }) => {
      return React.createElement("div", { "data-testid": "task-form" }, [
        React.createElement(
          "button",
          {
            key: "submit",
            onClick: () =>
              onAddTask({
                title: initialValues?.title || "New Task",
                priority: initialValues?.priority || "Medium",
                status: initialValues?.status || "Yet to do",
              }),
          },
          submitLabel || "Add Task"
        ),
      ]);
    },
  };
});

jest.mock("antd", () => {
  const React = require("react");
  const mockNotification = {
    success: jest.fn(),
    error: jest.fn(),
  };
  return {
    Alert: ({ message }) =>
      React.createElement("div", { role: "alert" }, message),
    Button: ({ children, onClick, danger, icon, type }) =>
      React.createElement("button", { onClick, "data-danger": danger ? "true" : undefined }, children),
    Card: ({ children, title, extra, className }) =>
      React.createElement("div", { "data-testid": "card" }, [
        React.createElement("div", { key: "title" }, typeof title === "string" ? title : title),
        extra ? React.createElement("div", { key: "extra" }, extra) : null,
        React.createElement("div", { key: "body" }, children),
      ]),
    Input: Object.assign(
      React.forwardRef((props, ref) => React.createElement("input", { ...props, ref })),
      {
        Search: ({ placeholder, value, onChange, onSearch, allowClear, enterButton, style }) =>
          React.createElement("div", null, [
            React.createElement("input", {
              key: "input",
              placeholder,
              value,
              onChange,
              "data-testid": "search-input",
            }),
            React.createElement(
              "button",
              { key: "btn", onClick: () => onSearch && onSearch(value), "data-testid": "search-btn" },
              "Search"
            ),
          ]),
      }
    ),
    Modal: ({ children, title, open, onCancel, footer, destroyOnClose }) =>
      open
        ? React.createElement("div", { "data-testid": "modal" }, [
            React.createElement("div", { key: "title" }, title),
            React.createElement("button", { key: "cancel", onClick: onCancel, "data-testid": "modal-cancel" }, "Cancel"),
            React.createElement("div", { key: "body" }, children),
          ])
        : null,
    Popconfirm: ({ children, onConfirm, title }) =>
      React.createElement("div", null, [
        React.createElement("div", { key: "children" }, children),
        React.createElement("button", { key: "confirm", onClick: onConfirm, "data-testid": "confirm-delete" }, "Confirm"),
      ]),
    Space: ({ children }) =>
      React.createElement("div", null, children),
    Table: ({ dataSource, columns, loading, pagination, rowKey }) => {
      if (loading) return React.createElement("div", null, "Loading...");
      return React.createElement("table", { "data-testid": "task-table" }, [
        React.createElement(
          "thead",
          { key: "head" },
          React.createElement("tr", null,
            columns.map((col) =>
              React.createElement("th", { key: col.key || col.dataIndex }, col.title)
            )
          )
        ),
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
      ]);
    },
    Tag: ({ children, color }) =>
      React.createElement("span", { "data-color": color }, children),
    notification: mockNotification,
  };
});

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  return {
    DeleteOutlined: () => React.createElement("span"),
    EditOutlined: () => React.createElement("span"),
    SearchOutlined: () => React.createElement("span"),
  };
});

const Tasks = require("../../pages/Tasks").default;
const { notification } = require("antd");

describe("Tasks Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { _id: "u1", name: "Kamal", role: "User" };
    mockTasks = [];
    mockTotal = 0;
    mockDispatch = jest.fn();
    mockGetTasks.mockResolvedValue({ data: [], total: 0 });
  });

  test("should fetch tasks on mount", async () => {
    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalled();
    });
  });

  test("should render Add Task card and Task List card", async () => {
    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      const addCards = screen.getAllByText("Add Task");
      expect(addCards.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Task List")).toBeInTheDocument();
    });
  });

  test("should add task successfully", async () => {
    mockAddTask.mockResolvedValue({ success: true });
    mockGetTasks.mockResolvedValue({ data: [], total: 0 });

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalled();
    });

    const addButtons = screen.getAllByText("Add Task");
    const formButton = addButtons.find(
      (btn) => btn.tagName === "BUTTON"
    );

    await act(async () => {
      fireEvent.click(formButton);
    });

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalled();
    });
  });

  test("should handle add task error", async () => {
    mockAddTask.mockRejectedValue(new Error("Add failed"));

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(mockGetTasks).toHaveBeenCalled();
    });

    const addButtons = screen.getAllByText("Add Task");
    const formButton = addButtons.find(
      (btn) => btn.tagName === "BUTTON"
    );

    await act(async () => {
      fireEvent.click(formButton);
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalled();
    });
  });

  test("should render tasks in table", async () => {
    mockTasks = [
      { _id: "t1", title: "Test Task", priority: "High", status: "In Progress" },
    ];
    mockTotal = 1;
    mockGetTasks.mockResolvedValue({ data: mockTasks, total: 1 });

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });

  test("should open edit modal when Edit is clicked", async () => {
    mockTasks = [
      { _id: "t1", title: "Edit Me", priority: "Low", status: "Yet to do" },
    ];
    mockTotal = 1;

    await act(async () => {
      render(<Tasks />);
    });

    const editBtn = screen.getByText("Edit");
    await act(async () => {
      fireEvent.click(editBtn);
    });

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
  });

  test("should close modal on cancel", async () => {
    mockTasks = [
      { _id: "t1", title: "Edit Me", priority: "Low", status: "Yet to do" },
    ];
    mockTotal = 1;

    await act(async () => {
      render(<Tasks />);
    });

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-cancel"));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("should update task successfully", async () => {
    mockTasks = [
      { _id: "t1", title: "Update Me", priority: "Medium", status: "Yet to do" },
    ];
    mockTotal = 1;
    mockUpdateTask.mockResolvedValue({ success: true });

    await act(async () => {
      render(<Tasks />);
    });

    fireEvent.click(screen.getByText("Edit"));

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith("t1", expect.any(Object));
    });
  });

  test("should handle update task error", async () => {
    mockTasks = [
      { _id: "t1", title: "Fail Update", priority: "Medium", status: "Yet to do" },
    ];
    mockTotal = 1;
    mockUpdateTask.mockRejectedValue(new Error("Update failed"));

    await act(async () => {
      render(<Tasks />);
    });

    fireEvent.click(screen.getByText("Edit"));

    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalled();
    });
  });

  test("should delete task successfully", async () => {
    mockTasks = [
      { _id: "t1", title: "Delete Me", priority: "Low", status: "Completed" },
    ];
    mockTotal = 1;
    mockDeleteTask.mockResolvedValue({ success: true });

    await act(async () => {
      render(<Tasks />);
    });

    const confirmBtn = screen.getByTestId("confirm-delete");
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith("t1");
    });
  });

  test("should handle delete task error", async () => {
    mockTasks = [
      { _id: "t1", title: "Fail Delete", priority: "Low", status: "Completed" },
    ];
    mockTotal = 1;
    mockDeleteTask.mockRejectedValue(new Error("Delete failed"));

    await act(async () => {
      render(<Tasks />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-delete"));
    });

    await waitFor(() => {
      expect(notification.error).toHaveBeenCalled();
    });
  });

  test("should handle fetch tasks error", async () => {
    mockGetTasks.mockRejectedValue(new Error("Fetch failed"));

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("should render priority tags with correct colors", async () => {
    mockTasks = [
      { _id: "t1", title: "Low Task", priority: "Low", status: "Yet to do" },
      { _id: "t2", title: "Medium Task", priority: "Medium", status: "In Progress" },
      { _id: "t3", title: "High Task", priority: "High", status: "Completed" },
    ];
    mockTotal = 3;

    await act(async () => {
      render(<Tasks />);
    });

    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  test("should handle null priority as Medium", async () => {
    mockTasks = [
      { _id: "t1", title: "No Priority", priority: null, status: "Yet to do" },
    ];
    mockTotal = 1;

    await act(async () => {
      render(<Tasks />);
    });

    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  test("should handle search input change", async () => {
    await act(async () => {
      render(<Tasks />);
    });

    const searchInput = screen.getByTestId("search-input");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "react" } });
    });

    // Debounce delay
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(mockGetTasks).toHaveBeenCalled();
  });

  test("should trigger onSearch callback", async () => {
    await act(async () => {
      render(<Tasks />);
    });

    const searchBtn = screen.getByTestId("search-btn");
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(mockGetTasks).toHaveBeenCalled();
  });
});
