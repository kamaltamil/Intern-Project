import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Switch,
  Checkbox,
  Radio,
} from "antd";

const { Password, TextArea } = Input;
const { RangePicker } = DatePicker;

const renderField = (field) => {
  switch (field.type) {
    case "password":
      return (
        <Password
          size="large"
          placeholder={field.placeholder}
          {...field.props}
        />
      );

    case "textarea":
      return (
        <TextArea rows={4} placeholder={field.placeholder} {...field.props} />
      );

    case "number":
      return (
        <InputNumber
          size="large"
          style={{ width: "100%" }}
          placeholder={field.placeholder}
          {...field.props}
        />
      );

    case "select":
      return (
        <Select
          size="large"
          placeholder={field.placeholder}
          options={field.options}
          {...field.props}
        />
      );

    case "datepicker":
      return (
        <DatePicker size="large" style={{ width: "100%" }} {...field.props} />
      );

    case "rangepicker":
      return (
        <RangePicker size="large" style={{ width: "100%" }} {...field.props} />
      );

    case "upload":
      return <Upload {...field.props}>{field.children}</Upload>;

    case "switch":
      return <Switch {...field.props} />;

    case "checkbox":
      return <Checkbox {...field.props}>{field.text}</Checkbox>;

    case "radio":
      return <Radio.Group options={field.options} {...field.props} />;

    case "input":
    default:
      return (
        <Input size="large" placeholder={field.placeholder} {...field.props} />
      );
  }
};

const CustomForm = ({
  form = [],
  formInstance,
  onFinish,
  layout = "vertical",
  className = "mt-6",
}) => {
  return (
    <Form
      form={formInstance}
      layout={layout}
      className={className}
      onFinish={onFinish}
    >
      {form.map((field) => {
        if (field.render) {
          return (
            <Form.Item key={field.key || field.name || field.type}>
              {field.render()}
            </Form.Item>
          );
        }

        if (field.type === "submit") {
          return (
            <Form.Item key={field.label}>
              <Button {...field.buttonProps}>{field.label}</Button>
            </Form.Item>
          );
        }

        const valuePropName =
          field.valuePropName ||
          (["switch", "checkbox"].includes(field.type)
            ? "checked"
            : "value");

        return (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={field.rules}
            valuePropName={valuePropName}
          >
            {renderField(field)}
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default CustomForm;