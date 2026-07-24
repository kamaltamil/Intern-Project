import api from "./axios";

/**
 * Auth API layer.
 *
 * All functions call the centralized Axios instance.
 * Authorization headers are attached automatically by the request interceptor
 * in axios.js — no manual header injection needed here.
 */

export const registerUser = async (name, email, password) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const loginUser = async (identifier, password) => {
  const response = await api.post("/auth/login", {
    email: identifier,
    username: identifier,
    password,
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.patch(`/auth/users/${id}`, {
    name: payload?.name,
    email: payload?.email,
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};

export const refreshToken = async (token) => {
  const response = await api.post("/auth/refresh", { refreshToken: token });
  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await api.post("/auth/profile/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};