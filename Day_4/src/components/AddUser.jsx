import React, { useEffect } from 'react'
import { Button, Form, Input, DatePicker, Row, Col, Modal } from 'antd'

const defaultValues = {
  firstname: '',
  lastname: '',
  email: '',
  mobile: '',
  location: '',
  dateofbirth: null
}

const AddUser = ({ open, onCancel, onSubmit, editingUser = null }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...defaultValues,
        ...(editingUser || {}),
        dateofbirth: null
      })
    }
  }, [open, editingUser, form])

  const handleSubmit = (values) => {
    const formatDate = (value) => {
      if (!value) return ''
      if (typeof value.format === 'function') return value.format('DD-MM-YYYY')
      return value
    }

    const userData = {
      firstname: values.firstname || '',
      lastname: values.lastname || '',
      email: values.email || '',
      mobile: values.mobile || '',
      location: values.location || '',
      dob: formatDate(values.dateofbirth)
    }

    onSubmit(userData)
    form.resetFields()
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      open={open}
      title={editingUser ? 'Edit User' : 'Add User'}
      onCancel={handleCancel}
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                { required: true, message: 'Enter your first name' },
                { pattern: /^[A-Za-z]+$/, message: 'Name should only contain text' }
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[{ pattern: /^[A-Za-z]+$/, message: 'Name should only contain text' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Enter a valid email' }]}
            >
              <Input type="email" placeholder="Enter your e-mail" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Date Of Birth" name="dateofbirth">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[
                { required: true, message: 'Enter the mobile number' },
                { pattern: /[0-9]{10}/, message: 'Enter valid mobile number' }
              ]}
            >
              <Input type="number" placeholder="Enter your mobile" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item 
              label="Location" 
              name="location"
              rules={[{ required: true, message: 'Please enter your location' }]}
            >
              <Input placeholder="Enter your location" />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            {editingUser ? 'Save' : 'Add'}
          </Button>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddUser