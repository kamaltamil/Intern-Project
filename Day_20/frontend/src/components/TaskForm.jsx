import { useEffect, useMemo } from "react";
import { Button, Form, Input, Select } from "antd";
import { TASK_PRIORITIES, TASK_STATUSES, DEFAULT_PRIORITY, DEFAULT_STATUS } from "../constants";

const SHOW_PRIORITY = process.env.REACT_APP_ENABLE_PRIORITY !== "false";
const EMPTY_INITIAL_VALUES = {};

const TaskForm = ({
  onAddTask,
  initialValues = EMPTY_INITIAL_VALUES,
  submitLabel = "Add Task",
}) => {
  const [form] = Form.useForm();

  const formInitialValues = useMemo(
    () => ({
      priority: DEFAULT_PRIORITY,
      status: DEFAULT_STATUS,
      ...initialValues,
    }),
    [initialValues]
  );

  useEffect(() => {
    form.setFieldsValue(formInitialValues);
  }, [form, formInitialValues]);

  const handleFinish = (values) => {
    onAddTask({
      ...values,
      priority: values.priority || DEFAULT_PRIORITY,
    });

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
          { required: true, message: "Task title is required" },
          { min: 3, message: "Minimum 3 characters" },
        ]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      {SHOW_PRIORITY && (
        <Form.Item label="Priority" name="priority">
          <Select options={TASK_PRIORITIES} />
        </Form.Item>
      )}

      <Form.Item label="Progress" name="status">
        <Select options={TASK_STATUSES} />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        {submitLabel}
      </Button>
    </Form>
  );
};

export default TaskForm;