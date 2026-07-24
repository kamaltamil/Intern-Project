import "./Tasks.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE, DEFAULT_PRIORITY, DEFAULT_STATUS } from "../constants";
import { useSelector, useDispatch } from "react-redux";
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  notification,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import debounce from "lodash.debounce";

import TaskForm from "../components/TaskForm";
import { setTasksData } from "../store/taskSlice";
import { addTask, deleteTask, getTasks, updateTask } from "../api/taskApi";

const { Search } = Input;

const Tasks = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.tasks.tasks);
  const total = useSelector((state) => state.tasks.total);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounced search using lodash.debounce — fires 300ms after the user stops typing.
  // useRef keeps the same debounced function across re-renders.
  const debouncedSetSearch = useRef(
    debounce((value) => {
      setSearch(value);
      setCurrentPage(1);
    }, 300)
  ).current;

  // Cleanup the debounced function on unmount to prevent memory leaks
  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTasks(currentPage, pageSize, search);
      dispatch(
        setTasksData({
          tasks: response.data || [],
          total: response.total || 0,
        })
      );
    } catch (err) {
      setError("Unable to fetch tasks.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, dispatch, pageSize, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = useCallback(async (task) => {
    try {
      const response = await addTask({
        ...task,
        priority: task.priority || DEFAULT_PRIORITY,
        userId: user?._id,
      });

      if (response.success) {
        notification.success({
          message: "Task added",
          description: "The task was created successfully.",
        });
        fetchTasks();
      }
    } catch (err) {
      setError("Unable to add task.");
      notification.error({
        message: "Task add failed",
        description: "Unable to add the task right now.",
      });
    }
  }, [fetchTasks, user?._id]);

  const handleUpdateTask = useCallback(async (id, values) => {
    try {
      const response = await updateTask(id, {
        ...values,
        priority: values.priority || DEFAULT_PRIORITY,
      });

      if (response.success) {
        setIsModalOpen(false);
        setEditingTask(null);
        notification.success({
          message: "Task updated",
          description: "The task was updated successfully.",
        });
        fetchTasks();
      }
    } catch (err) {
      setError("Unable to update task.");
      notification.error({
        message: "Task update failed",
        description: "Unable to update the task right now.",
      });
    }
  }, [fetchTasks]);

  const handleDeleteTask = useCallback(async (id) => {
    try {
      const response = await deleteTask(id);

      if (response.success) {
        notification.success({
          message: "Task deleted",
          description: "The task was deleted successfully.",
        });
        fetchTasks();
      }
    } catch (err) {
      setError("Unable to delete task.");
      notification.error({
        message: "Task delete failed",
        description: "Unable to delete the task right now.",
      });
    }
  }, [fetchTasks]);

  const handleEditClick = useCallback((task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  // Memoized columns — prevents Ant Design Table from re-rendering
  // all cells when only unrelated state changes.
  const columns = useMemo(() => [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority) => {
        const value = priority || DEFAULT_PRIORITY;
        const colorMap = { Low: "green", Medium: "orange", High: "red" };
        return <Tag color={colorMap[value]}>{value}</Tag>;
      },
    },
    {
      title: "Progress",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "Completed"
              ? "green"
              : status === "In Progress"
              ? "blue"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete this task?"
            onConfirm={() => handleDeleteTask(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [handleEditClick, handleDeleteTask]);

  return (
    <>
      <Card title="Add Task" className="task-card">
        <TaskForm onAddTask={handleAddTask} />
      </Card>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      )}

      <Card
        title="Task List"
        extra={
          <Search
            placeholder="Search tasks..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={(value) => {
              setSearchInput(value);
              setSearch(value);
              setCurrentPage(1);
            }}
          />
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="Edit Task"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        {editingTask && (
          <TaskForm
            initialValues={{
              title: editingTask.title,
              priority: editingTask.priority || DEFAULT_PRIORITY,
              status: editingTask.status || DEFAULT_STATUS,
            }}
            submitLabel="Save"
            onAddTask={(values) =>
              handleUpdateTask(editingTask._id, values)
            }
          />
        )}
      </Modal>
    </>
  );
};

export default Tasks;