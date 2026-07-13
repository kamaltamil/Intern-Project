import axiosInstance from './axiosInstance';

export const getColumns = async (boardId) => {
  const { data } = await axiosInstance.get(`/columns?boardId=${boardId}&_sort=order`);
  return data;
};

export const createColumn = async (column) => {
  const { data } = await axiosInstance.post('/columns', column);
  return data;
};

export const updateColumn = async ({ id, ...updates }) => {
  const { data } = await axiosInstance.patch(`/columns/${id}`, updates);
  return data;
};

export const deleteColumn = async (id) => {
  const { data } = await axiosInstance.delete(`/columns/${id}`);
  return data;
};
