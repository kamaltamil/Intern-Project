import { useEffect } from "react";
import { Button, Form, Input, Select } from "antd";

const showPriority = process.env.REACT_APP_ENABLE_PRIORITY !== "false";

const TaskForm = ({
  onAddTask,
  initialValues = {},
  submitLabel = "Add Task",
}) => {
  const [form] = Form.useForm();

  const formInitialValues = {
    priority: "Medium",
    status: "Yet to do",
    ...initialValues,
  };

  useEffect(() => {
    form.setFieldsValue(formInitialValues);
  }, [form, initialValues]);

  const handleFinish = (values) => {
    onAddTask({
      ...values,
      priority: values.priority || "Medium",
    });

    // Don't clear form while editing
    if (submitLabel === "Add Task") {
      form.resetFields();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={formInitialValues}
    >
      <Form.Item
        label="Task Title"
        name="title"
        rules={[
          {
            required: true,
            message: "Task title is required",
          },
          {
            min: 3,
            message: "Minimum 3 characters",
          },
        ]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      {showPriority && (
        <Form.Item
          label="Priority"
          name="priority"
        >
          <Select
            options={[
              {
                label: "Low",
                value: "Low",
              },
              {
                label: "Medium",
                value: "Medium",
              },
              {
                label: "High",
                value: "High",
              },
            ]}
          />
        </Form.Item>
      )}

      <Form.Item
        label="Progress"
        name="status"
      >
        <Select
          options={[
            {
              label: "Yet to do",
              value: "Yet to do",
            },
            {
              label: "In Progress",
              value: "In Progress",
            },
            {
              label: "Completed",
              value: "Completed",
            },
          ]}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
      >
        {submitLabel}
      </Button>
    </Form>
  );
};

export default TaskForm;