import api from "./axios";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerUser = async (name, email, password) => {
  const response = await api.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (identifier, password) => {
  const response = await api.post(`${API_URL}/auth/login`, {
    email: identifier,
    username: identifier,
    password,
  });

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get(`${API_URL}/auth/profile`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getUsers = async () => {
  const response = await api.get(`${API_URL}/auth/users`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`${API_URL}/auth/users/${id}`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`${API_URL}/auth/users/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  const response = await api.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
  return response.data;
};