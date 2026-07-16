import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Layout, Typography, Card, Space, Tabs, Select } from 'antd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal } from '../store/uiSlice';
import api from '../api/axiosInstance';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const courseOptions = ['MSC', 'BSC', 'CSE', 'IT', 'MCA', 'BCA', 'Other'];

const StudentManager = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [profileForm] = Form.useForm();
  const [markForm] = Form.useForm();
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { isModalVisible, editingStudent } = useSelector((state) => state.ui);

  // Fetch Students
  const { data, isLoading } = useQuery(['students', search, page], () => 
    api.get(`/students?search=${search}&page=${page}&limit=${pageSize}`).then(res => res.data),
    { keepPreviousData: true }
  );

  const students = data?.students || [];
  const totalCount = data?.totalCount || 0;

  // Mutations
  const saveStudentMutation = useMutation((data) => {
    if (editingStudent?._id) {
      return api.put(`/students/${editingStudent._id}`, data);
    }
    return api.post('/students', data);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('students');
      message.success(editingStudent?._id ? 'Updated!' : 'Added!');
      profileForm.resetFields();
      dispatch(closeModal());
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Unable to save student';
      message.error(errorMessage);
    }
  });

  const saveAcademicMutation = useMutation((data) => api.post('/marks', data), {
    onSuccess: () => {
      queryClient.invalidateQueries('students');
      message.success('CGPA saved!');
      markForm.resetFields();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Unable to save CGPA';
      message.error(errorMessage);
    }
  });

  const deleteMutation = useMutation((id) => api.delete(`/students/${id}`), {
    onSuccess: () => { queryClient.invalidateQueries('students'); message.success("Deleted!"); }
  });

  useEffect(() => {
    if (editingStudent) {
      profileForm.setFieldsValue({
        ...editingStudent,
        age: editingStudent.age ?? undefined,
      });

      const latestMark = editingStudent.academicMarks?.[0];
      if (latestMark) {
        markForm.setFieldsValue({
          course: latestMark.course,
          cgpa: latestMark.cgpa,
        });
      } else {
        markForm.resetFields();
      }
    } else {
      profileForm.resetFields();
      markForm.resetFields();
    }
  }, [editingStudent, profileForm, markForm]);

  const handleProfileSubmit = (vals) => {
    const payload = {
      ...vals,
      name: vals.name?.trim(),
      mail: vals.mail?.trim(),
      age: Number(vals.age),
    };

    const handleSuccess = () => {
      const academicValues = markForm.getFieldsValue();
      if (editingStudent?._id && academicValues.course && academicValues.cgpa !== undefined) {
        saveAcademicMutation.mutate({
          student: editingStudent._id,
          course: academicValues.course,
          cgpa: Number(academicValues.cgpa),
        });
      }
      dispatch(closeModal());
    };

    saveStudentMutation.mutate(payload, {
      onSuccess: handleSuccess,
    });
  };

  const tabsItems = [
    {
      key: 'profile', label: 'Profile', children: (
        <Form form={profileForm} layout="vertical" onFinish={handleProfileSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }, { whitespace: true, message: 'Name cannot be empty' }]}><Input /></Form.Item>
          <Form.Item name="mail" label="Email" rules={[{ required: true, message: 'Please enter an email' }, { type: 'email', message: 'Please enter a valid email' }]}><Input /></Form.Item>
          <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Please enter age' }, { type: 'number', min: 1, message: 'Age must be at least 1' }]}><InputNumber style={{width:'100%'}} /></Form.Item>
          <Button type="primary" htmlType="submit">{editingStudent?._id ? 'Update Profile' : 'Save Profile'}</Button>
        </Form>
      )
    },
    {
      key: 'academic', label: 'Assign CGPA', children: (
        <Form form={markForm} layout="vertical">
          <Form.Item name="course" label="Course" rules={[{ required: true, message: 'Please select a course' }]}>
            <Select placeholder="Select a course">
              {courseOptions.map((course) => (
                <Select.Option key={course} value={course}>{course}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="cgpa" label="CGPA" rules={[{ required: true, message: 'Please enter CGPA' }, { type: 'number', min: 0, max: 10, message: 'CGPA must be between 0 and 10' }]}><InputNumber style={{width:'100%'}} step={0.1}/></Form.Item>
        </Form>
      )
    }
  ];

  return (
    <Layout style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content>
        <Card title={<Title level={3}>Student Management System</Title>}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: 20, flexWrap: 'wrap' }}>
            <Search placeholder="Search name/mail" onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} />
            <Button type="primary" onClick={() => dispatch(openModal())}>Add Student</Button>
          </div>

          <Table 
            dataSource={students || []} 
            rowKey="_id" 
            loading={isLoading}
            scroll={{ x: 320 }}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Email', dataIndex: 'mail' },
              { title: 'Course', dataIndex: 'academicMarks', render: (marks) => marks?.[0]?.course ?? '—' },
              { title: 'CGPA', dataIndex: 'academicMarks', render: (marks) => marks?.[0]?.cgpa ?? '—' },
              { title: 'Grade', dataIndex: 'academicMarks', render: (marks) => marks?.[0]?.grade ?? '—' },
              { title: 'Action', render: (r) => (
                <Space>
                  <Button onClick={() => dispatch(openModal(r))}>Update</Button>
                  <Popconfirm title="Delete?" onConfirm={() => deleteMutation.mutate(r._id)}>
                    <Button danger>Delete</Button>
                  </Popconfirm>
                </Space>
              )}
            ]}
            pagination={{
              current: page,
              pageSize,
              total: totalCount,
              showSizeChanger: false,
              onChange: setPage,
            }}
          />
        </Card>
      </Content>

      <Modal open={isModalVisible} onCancel={() => dispatch(closeModal())} footer={null} destroyOnClose>
        <Tabs items={tabsItems} />
      </Modal>
    </Layout>
  );
};

export default StudentManager;