import axiosInstance from './axiosInstance';

/** Fetch boards belonging to a specific user */
export const getBoards = async (userId) => {
  const { data } = await axiosInstance.get(`/boards?userId=${userId}`);
  return data;
};

export const createBoard = async (board) => {
  const { data } = await axiosInstance.post('/boards', board);
  return data;
};

export const updateBoard = async ({ id, ...updates }) => {
  const { data } = await axiosInstance.patch(`/boards/${id}`, updates);
  return data;
};

export const deleteBoard = async (id) => {
  const { data } = await axiosInstance.delete(`/boards/${id}`);
  return data;
};
