import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Flex, Form, Input, Modal, message, Select } from 'antd'
import dayjs from 'dayjs'

const DEPARTMENTS = [
  { label: 'B.Sc (Computer Science)', value: 'B.Sc (Computer Science)' },
  { label: 'M.Sc (Computer Science)', value: 'M.Sc (Computer Science)' },
  { label: 'B.E (CSE)', value: 'B.E (CSE)' },
  { label: 'B.Tech (IT)', value: 'B.Tech (IT)' },
  { label: 'B.A (Humanities)', value: 'B.A (Humanities)' },
  { label: 'B.Com (Commerce)', value: 'B.Com (Commerce)' }
]

const AddStd = ({ open, setOpen, handleCancel, onDataAdded, editingStudent, setEditingStudent }) => {
  const [form] = Form.useForm()
  const [isFormValid, setIsFormValid] = useState(false)

  const students = JSON.parse(localStorage.getItem('students')) || []
  const totalStudents = students.length
  const presentStudents = students.filter(student => student.isPresent).length
  const absentStudents = totalStudents - presentStudents

  useEffect(() => {
    if (editingStudent) {
      form.setFieldsValue({
        name: editingStudent.name,
        rollNumber: editingStudent.rollNumber,
        department: editingStudent.department,
        dateofbirth: editingStudent.dateofbirth ? dayjs(editingStudent.dateofbirth) : null
      })
      setIsFormValid(true)
    } else if (!open) {
      form.resetFields()
      setIsFormValid(false)
    }
  }, [editingStudent, form, open])

  const handleFormChange = (changedValues) => {
    const currentValues = {
      ...form.getFieldsValue(),
      ...changedValues
    }
    setIsFormValid(
      !!currentValues.name &&
      !!currentValues.rollNumber &&
      !!currentValues.department &&
      !!currentValues.dateofbirth
    )
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const existingData = JSON.parse(localStorage.getItem('students')) || []
      const dateofbirth = typeof values.dateofbirth === 'string'
        ? values.dateofbirth
        : values.dateofbirth.format('YYYY-MM-DD')

      if (editingStudent) {
        const updatedData = existingData.map(student =>
          student.id === editingStudent.id
            ? {
                ...student,
                name: values.name,
                rollNumber: values.rollNumber,
                department: values.department,
                dateofbirth,
              }
            : student
        )
        localStorage.setItem('students', JSON.stringify(updatedData))
        message.success('Student updated successfully!')
        setEditingStudent(null)
      } else {
        const newStudent = {
          id: Date.now(),
          name: values.name,
          rollNumber: values.rollNumber,
          department: values.department,
          dateofbirth,
          isPresent: false
        }
        localStorage.setItem('students', JSON.stringify([...existingData, newStudent]))
        message.success('Student added successfully!')
      }

      form.resetFields()
      setIsFormValid(false)
      setOpen(false)
      if (onDataAdded) onDataAdded()
    } catch (errorInfo) {
      // validation failed; Ant Design will highlight fields
      message.error('Please fill in all required fields correctly.')
    }
  }

  return (
    <Flex align="center" justify="center" style={{ width: '100%'}}>
        <Flex justify="space-between" align="center" style={{ gap: '20px' , width: '100%', padding: '10px', boxSizing: 'border-box', flexWrap: 'wrap'}}>
            <Flex gap="12px" wrap="wrap" align="center">
                <div style={{ background: '#f5f7ff', padding: '8px 12px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Students</div>
                    <strong style={{ fontSize: '16px', color: 'var(--primary-color)' }}>{totalStudents}</strong>
                </div>
                <div style={{ background: '#f6ffed', padding: '8px 12px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Present</div>
                    <strong style={{ fontSize: '16px', color: '#52c41a' }}>{presentStudents}</strong>
                </div>
                <div style={{ background: '#fff1f0', padding: '8px 12px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Absent</div>
                    <strong style={{ fontSize: '16px', color: '#cf1322' }}>{absentStudents}</strong>
                </div>
            </Flex>
            <Button type="primary" style={{background: 'var(--primary-color)', color: 'white'}} onClick={() => setOpen(true)}>
                Add Student
            </Button>
        </Flex>
      <Modal
            open={open}
            onCancel={handleCancel}
            destroyOnHidden
            footer={null}
    >
        <Form
          form={form}
          layout="vertical"
          style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}
          onValuesChange={handleFormChange}
        >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
            <Form.Item label="Name" name="name" required rules={[{ required: true, message: 'Please enter name' }]}>
                <Input type="text" placeholder='Enter Name' />
            </Form.Item>
            <Form.Item label="Roll Number" name="rollNumber" required rules={[{ required: true, message: 'Please enter roll number' }]}>
                <Input type="number" placeholder='Enter Roll Number' />
            </Form.Item>
            <Form.Item label="Department" name="department" required rules={[{ required: true, message: 'Please select department' }]}>
                <Select
                  placeholder='Select Department'
                  options={DEPARTMENTS}
                />
            </Form.Item>
            <Flex sm={{ direction: 'column' }} md={{ direction: 'row' }} lg={{ direction: 'row' }} style={{ gap: '10px' }}>
                <Form.Item label="Date of Birth" name="dateofbirth" style={{ flex: 1, width: '100%' }} rules={[{ required: true, message: 'Please select date of birth' }]}>
                    <DatePicker placeholder='Enter Date of Birth' />
                </Form.Item>
                <Button
                  type="primary"
                  disabled={!isFormValid}
                  onClick={handleSubmit}
                  style={{
                    background: isFormValid ? 'var(--primary-color)' : '#d9d9d9',
                    color: isFormValid ? 'white' : '#000',
                    marginTop: '30px',
                    marginLeft: '10px',
                    flex: 1,
                    cursor: isFormValid ? 'pointer' : 'not-allowed'
                  }}
                >
                  Submit
                </Button>
            </Flex>
        </Form>
      </Modal>
    </Flex>
  )
}

export default AddStd