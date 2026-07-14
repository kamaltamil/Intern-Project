import React from 'react';
import { Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../features/filterSlice';

export default function FilterInput() {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.filter.searchTerm);

  return (
    <Input
      placeholder="Search posts by title..."
      size="large"
      value={searchTerm}
      onChange={(e) => dispatch(setSearchTerm(e.target.value))}
      style={{ marginBottom: '1.5rem' }}
    />
  );
}