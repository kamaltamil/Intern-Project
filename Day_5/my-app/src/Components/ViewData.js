import { Table, Button, Space, Input, message, Flex, Switch } from 'antd'
import React, { useState, useEffect } from 'react'

const DEPARTMENTS = [
  'B.Sc (Computer Science)',
  'M.Sc (Computer Science)',
  'B.E (CSE)',
  'B.Tech (IT)',
  'B.A (Humanities)',
  'B.Com (Commerce)'
]

const ViewData = ({ editingStudent, setEditingStudent, setOpen, onEdit }) => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchByName, setSearchByName] = useState('')
  const [searchByRoll, setSearchByRoll] = useState('')

  // Load data from localStorage on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Handle search - filter by name or roll number
  useEffect(() => {
    let filtered = data

    if (searchByName.trim() !== '') {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchByName.toLowerCase())
      )
    }

    if (searchByRoll.trim() !== '') {
      filtered = filtered.filter(student =>
        student.rollNumber.toString().includes(searchByRoll)
      )
    }

    setFilteredData(filtered)
  }, [searchByName, searchByRoll, data])

  const loadData = () => {
    const storedData = JSON.parse(localStorage.getItem('students')) || []
    setData(storedData)
    setFilteredData(storedData)
  }

  const handleTogglePresent = (id, currentStatus) => {
    const updatedData = data.map(student =>
      student.id === id ? { ...student, isPresent: !currentStatus } : student
    )
    setData(updatedData)
    setFilteredData(
      filteredData.map(student =>
        student.id === id ? { ...student, isPresent: !currentStatus } : student
      )
    )
    localStorage.setItem('students', JSON.stringify(updatedData))
    if (onEdit) onEdit()
    message.success(`${updatedData.find(s => s.id === id)?.name} marked as ${!currentStatus ? 'Present' : 'Absent'}`)
  }

  const handleDelete = (id) => {
    const updatedData = data.filter(student => student.id !== id)
    localStorage.setItem('students', JSON.stringify(updatedData))
    setData(updatedData)
    if (onEdit) onEdit()
    message.success(`${updatedData.find(s => s.id === id)?.name} Student deleted successfully!`)
  }

  const handleEdit = (record) => {
    setEditingStudent(record)
    setOpen(true)
    if (onEdit) onEdit(record)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
      width: 130
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      filters: DEPARTMENTS.map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateofbirth',
      key: 'dateofbirth',   
      width: 130
    },
    {
      title: 'Present/Absent',
      key: 'isPresent',
      width: 140,
      render: (_, record) => (
        <Switch
          checked={record.isPresent || false}
          onChange={() => handleTogglePresent(record.id, record.isPresent || false)}
          checkedChildren="Present"
          unCheckedChildren="Absent"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" style={{background: 'var(--primary-color)'}} onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <Flex style={{ marginBottom: '20px', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
        <Flex style={{ flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>Search by Name:</label>
            <Input
              placeholder="Enter student name"
              value={searchByName}
              onChange={(e) => setSearchByName(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
        </Flex>
        <Flex style={{ flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>Search by Roll Number:</label>
            <Input
              placeholder="Enter roll number"
              value={searchByRoll}
              onChange={(e) => setSearchByRoll(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
        </Flex>
      </Flex>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          className="primary-table"
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </div>
    </div>
  )
}

export default ViewData