import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTasks = async (
  page = 1,
  limit = 5,
  search = ""
) => {
  const response = await axios.get(`${API_URL}/tasks`, {
    params: {
      page,
      limit,
      search,
    },
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axios.get(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const addTask = async (task) => {
  const response = await axios.post(`${API_URL}/tasks`, task, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await axios.put(`${API_URL}/tasks/${id}`, task, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};