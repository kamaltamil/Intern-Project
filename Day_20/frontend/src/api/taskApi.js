import api from "./axios";

/**
 * Task API layer.
 *
 * All functions call the centralized Axios instance.
 * Authorization headers are attached automatically by the request interceptor
 * in axios.js — no manual header injection needed here.
 */

export const getTasks = async (page = 1, limit = 5, search = "") => {
  const response = await api.get("/tasks", {
    params: { page, limit, search },
  });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const addTask = async (task) => {
  const response = await api.post("/tasks", task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};