// src/components/PostsTable.jsx
import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Popconfirm, message, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost, updatePost, deletePost } from '../features/postsSlice';

export default function PostsTable() {
  const dispatch = useDispatch();
  
  const { posts, isLoading } = useSelector((state) => state.posts);
  const searchTerm = useSelector((state) => state.filter.searchTerm);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [sortOrder, setSortOrder] = useState('default');
  const [form] = Form.useForm();

  // Load posts from YOUR backend on mount
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Apply Search Filter
  let displayPosts = posts.filter(post => {
    const title = post?.title || ''; 
    const search = searchTerm || '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  // Apply Sorting
  if (sortOrder === 'asc') displayPosts = displayPosts.sort((a, b) => a.title.localeCompare(b.title));
  if (sortOrder === 'desc') displayPosts = displayPosts.sort((a, b) => b.title.localeCompare(a.title));

  const handleSubmit = (values) => {
    if (editingPost) {
      // Backend figures out which API to call based on the ID!
      dispatch(updatePost({ id: editingPost.id, data: values }));
      message.success('Post updated!');
    } else {
      dispatch(createPost(values));
      message.success('Post created successfully!');
    }
    setIsModalOpen(false);
    form.resetFields();
    setEditingPost(null);
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', width: '25%' },
    { title: 'Content', dataIndex: 'body', key: 'body', render: (t) => `${t.substring(0, 40)}...` },
    { 
      title: 'Source', dataIndex: 'source', key: 'source',
      render: (source) => (
        <Tag color={source === 'DummyJSON' ? 'magenta' : source === 'JSONPlaceholder' ? 'cyan' : 'green'}>
          {source}
        </Tag>
      )
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => {
            setEditingPost(record);
            form.setFieldsValue(record);
            setIsModalOpen(true);
          }}>
            Edit
          </Button>
          <Popconfirm 
            title="Delete this post?" 
            onConfirm={() => {
              dispatch(deletePost(record.id));
              message.success('Post deleted!');
            }} 
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setIsModalOpen(true); form.resetFields(); setEditingPost(null); }}>
          + Add New Post
        </Button>
        <Select defaultValue="default" style={{ width: 150 }} onChange={setSortOrder}>
          <Select.Option value="default">Default Order</Select.Option>
          <Select.Option value="asc">Title: A to Z</Select.Option>
          <Select.Option value="desc">Title: Z to A</Select.Option>
        </Select>
      </Space>

      <Table dataSource={displayPosts} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 5 }} />

      <Modal
        title={editingPost ? "Edit Post" : "Create New Post"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="body" label="Content" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}