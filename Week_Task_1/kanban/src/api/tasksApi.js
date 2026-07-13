import axiosInstance from './axiosInstance';

export const getTasks = async (boardId) => {
  const { data } = await axiosInstance.get(`/tasks?boardId=${boardId}`);
  return data;
};

export const createTask = async (task) => {
  const { data } = await axiosInstance.post('/tasks', task);
  return data;
};

export const updateTask = async ({ id, ...updates }) => {
  const { data } = await axiosInstance.patch(`/tasks/${id}`, updates);
  return data;
};

export const deleteTask = async (id) => {
  await axiosInstance.delete(`/tasks/${id}`);
};
