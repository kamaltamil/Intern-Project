import api from "./api";

export const loginUser = async (payload) => {
  const response = await api.post("/users/login", payload);
  return response.data || {};
};
export const signupUser = async (payload) => {
  const response = await api.post("/users/signup", payload);
  return response.data || {};
};
export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data || {};
};
export const fetchMe = async () => {
  const response = await api.get("/users/profile");
  return response.data || {};
};
export const fetchMyPermissions = async () => {
  const response = await api.get("/users/permissions");
  return response.data || {};
};
export const updateProfile = async (payload) => {
  const response = await api.patch("/users/profile", payload);
  return response.data || {};
};
export const refreshToken = async (payload) => {
  const response = await api.post("/users/refresh", payload);
  return response.data || {};
};

export const fetchUsers = async () => {
  const response = await api.get("/manage/users");
  return Array.isArray(response.data) ? response.data : [];
};
export const fetchUserById = async (id) => {
  const response = await api.get(`/manage/users/${id}`);
  return response.data || null;
};
export const createUser = async (payload) => {
  const response = await api.post("/manage/users", payload);
  return response.data?.user || response.data;
};
export const updateUser = async ({ id, payload }) => {
  const response = await api.patch(`/manage/users/${id}`, payload);
  return response.data?.user || response.data;
};
export const deleteUser = async (id) => {
  const response = await api.delete(`/manage/users/${id}`);
  return response.data || {};
};

export const fetchRoles = async () => {
  const response = await api.get("/roles");
  return Array.isArray(response.data) ? response.data : [];
};
export const fetchRoleById = async (id) => {
  const response = await api.get(`/roles/${id}`);
  return response.data || null;
};
export const fetchRoleByName = async (name) => {
  const roles = await fetchRoles();
  return roles.find((role) => role?.name === name) || null;
};
export const createRole = async (payload) => {
  const response = await api.post("/roles", payload);
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

export const fetchBookings = async () => {
  const response = await api.get("/booking");
  return response.data?.bookings || response.data || [];
};
export const createBooking = async (payload) => {
  const response = await api.post("/booking/new", payload);
  return response.data || {};
};
export const updateBooking = async ({ id, payload }) => {
  const response = await api.patch(`/booking/${id}`, payload);
  return response.data?.booking || response.data || {};
};

export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data?.rooms || response.data || [];
};
export const createRoom = async (payload) => {
  const response = await api.post("/rooms/new", payload);
  return response.data || {};
};
export const updateRoom = async ({ id, payload }) => {
  const response = await api.patch(`/rooms/${id}`, payload);
  return response.data?.room || response.data || {};
};
export const deleteRoom = async (id) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data || {};
};

export const fetchPendingApprovals = async () => {
  const response = await api.get("/approval");
  return response.data?.bookings || [];
};
export const approveBooking = async (id) => {
  const response = await api.patch(`/approval/${id}/approve`);
  return response.data || {};
};
export const rejectBooking = async (id) => {
  const response = await api.patch(`/approval/${id}/reject`);
  return response.data || {};
};

export const fetchReports = async () => {
  const response = await api.get("/reports");
  return response.data?.report || {};
};

export const subscribeToNewsletter = async (email) => {
  const response = await api.post("/subscriptions", { email });
  return response.data || {};
};
