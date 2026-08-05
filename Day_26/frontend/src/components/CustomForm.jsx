import { Button, Form, Input } from 'antd';
import React from 'react'

const CustomForm = ({ form, onFinish }) => {
  return (
    <Form layout="vertical" className="mt-6" onFinish={onFinish}>
          { form.map((field) => {
            if (field.type === 'submit') {
              return (
                <Form.Item key={field.name}>
                  <Button {...field.buttonProps}>{field.label}</Button>
                </Form.Item>
              );
            }
            return (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={field.rules}
              >
                <Input placeholder={field.placeholder} size="large" />
              </Form.Item>
            );
          }) }
    </Form>
  )
}

export default CustomForm