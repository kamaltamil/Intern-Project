import api from './api';

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data || [];
};

export const fetchRoles = async () => {
  const response = await api.get('/roles');
  return response.data || [];
};

export const fetchRooms = async () => {
  const response = await api.get('/rooms');
  return response.data?.rooms || response.data || [];
};

export const fetchBookings = async () => {
  const response = await api.get('/booking');
  return response.data?.bookings || response.data || [];
};

export const signupUser = async (payload) => {
  const response = await api.post('/users', payload);
  return response.data || {};
};

export const loginUser = async (payload) => {
  const response = await api.post('/users/login', payload);
  return response.data || {};
};

export const logoutUser = async (userId) => {
  const response = await api.post('/users/logout', { userId });
  return response.data || {};
};

export const fetchMe = async () => {
  const response = await api.get('/users/me');
  return response.data || {};
};

export const updateUser = async ({ id, payload }) => {
  const config = {};
  if (payload instanceof FormData) {
    // Let the browser / axios set the Content-Type (including boundary) for FormData.
    // Avoid setting 'multipart/form-data' header explicitly because it prevents
    // the boundary from being added and can break file uploads.
  }
  const response = await api.patch(`/users/${id}`, payload, config);
  return response.data?.user || response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data || {};
};

export const createRole = async (payload) => {
  const response = await api.post('/roles', payload);
  return response.data?.role || response.data;
};

export const updateRole = async ({ id, payload }) => {
  const response = await api.patch(`/roles/${id}`, payload);
  return response.data?.role || response.data;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data || {};
};

export const createBooking = async (payload) => {
  const response = await api.post('/booking/new', payload);
  return response.data || {};
};
