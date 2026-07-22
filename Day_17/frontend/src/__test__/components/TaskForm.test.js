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
const userEvent = require("@testing-library/user-event").default;
const TaskForm = require("../../components/TaskForm").default;

// v14+ has userEvent.setup(); earlier versions call userEvent.click() directly.
const clickButton = async (button) => {
  if (typeof userEvent.setup === "function") {
    const user = userEvent.setup();
    await user.click(button);
  } else {
    await userEvent.click(button);
  }
};

describe("TaskForm Component", () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render the form with default fields and submit label", async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    expect(await screen.findByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Progress/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Task/i })).toBeInTheDocument();
  });

  test("should render the form with custom initial values and submit label", async () => {
    const initialValues = {
      title: "Existing Task",
      priority: "High",
      status: "In Progress",
    };

    render(
      <TaskForm
        onAddTask={mockOnAddTask}
        initialValues={initialValues}
        submitLabel="Update Task"
      />
    );

    expect(await screen.findByDisplayValue("Existing Task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update Task/i })).toBeInTheDocument();
  });

  test("should call onAddTask with correct values on successful submission", async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = await screen.findByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "New Test Task" } });

    const submitButton = screen.getByRole("button", { name: /Add Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledTimes(1);
      expect(mockOnAddTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Test Task",
          priority: "Medium",
          status: "Yet to do",
        })
      );
    });
  });

  test("should reset the form after adding a new task", async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = await screen.findByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "Task to be cleared" } });

    await clickButton(screen.getByRole("button", { name: /Add Task/i }));

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });

  test("should NOT reset the form when submitLabel indicates edit mode", async () => {
    const initialValues = { title: "Editable Task", priority: "Low", status: "Yet to do" };

    render(
      <TaskForm
        onAddTask={mockOnAddTask}
        initialValues={initialValues}
        submitLabel="Update Task"
      />
    );

    const titleInput = await screen.findByDisplayValue("Editable Task");
    fireEvent.click(screen.getByRole("button", { name: /Update Task/i }));

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    });

    expect(titleInput).toHaveValue("Editable Task");
  });

  test("should display validation error if title is empty", async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const submitButton = await screen.findByRole("button", { name: /Add Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Task title is required")).toBeInTheDocument();
    });

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  test("should display validation error if title is less than 3 characters", async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);

    const titleInput = await screen.findByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: "AB" } });

    const submitButton = screen.getByRole("button", { name: /Add Task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Minimum 3 characters")).toBeInTheDocument();
    });

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });
});