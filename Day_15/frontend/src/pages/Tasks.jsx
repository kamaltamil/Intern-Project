import "./Tasks.css";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  notification,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import TaskForm from "../components/TaskForm";
import { AuthContext } from "../context/AuthContext";

import {
  addTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../api/taskApi";

const { Search } = Input;

const Tasks = () => {
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  // Search
  const [search, setSearch] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await getTasks(
        currentPage,
        pageSize,
        search
      );

      setTasks(response.data);
      setTotal(response.total);
    } catch (err) {
      setError("Unable to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage, pageSize, search]);

  const handleAddTask = async (task) => {
    try {
      const response = await addTask({
        ...task,
        priority: task.priority || "Medium",
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
  };

  const handleUpdateTask = async (id, values) => {
    try {
      const response = await updateTask(id, {
        ...values,
        priority: values.priority || "Medium",
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
  };

  const handleDeleteTask = async (id) => {
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
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority) => {
        const value = priority || "Medium";
        let color = "green";

        if (value === "Medium") color = "orange";

        if (value === "High") color = "red";

        return <Tag color={color}>{value}</Tag>;
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
            onConfirm={() =>
              handleDeleteTask(record._id)
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
    if (loading) {
    return <Spin size="large" />;
  }

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
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
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
            onSearch={(value) => {
              setCurrentPage(1);
              setSearch(value);
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
              priority: editingTask.priority || "Medium",
              status:
                editingTask.status || "Yet to do",
            }}
            submitLabel="Save"
            onAddTask={(values) =>
              handleUpdateTask(
                editingTask._id,
                values
              )
            }
          />
        )}
      </Modal>
    </>
  );
};

export default Tasks;