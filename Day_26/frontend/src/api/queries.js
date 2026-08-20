import api from "./api";

// Submits credentials to login and returns token + role permissions.
export const loginUser = async (payload) => {
  const response = await api.post("/users/login", payload);
  return response.data || {};
};

// Registers a new user account.
export const signupUser = async (payload) => {
  const response = await api.post("/users/signup", payload);
  return response.data || {};
};

// Revokes the user's refresh token on the server.
export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data || {};
};

// Fetches the current user's profile and assigned role details.
export const fetchMe = async () => {
  const response = await api.get("/users/profile");
  return response.data || {};
};

// Fetches real-time role, permissions, and dashboard configuration.
export const fetchMyPermissions = async () => {
  const response = await api.get("/users/permissions");
  return response.data || {};
};

// Updates user profile information (name, password, or avatar).
export const updateProfile = async (payload) => {
  const response = await api.patch("/users/profile", payload);
  return response.data || {};
};

// Deletes the logged-in user's own account.
export const deleteOwnProfile = async () => {
  const response = await api.delete("/users/profile");
  return response.data || {};
};

// Refreshes an expired access token using the refresh token.
export const refreshToken = async (payload) => {
  const response = await api.post("/users/refresh", payload);
  return response.data || {};
};

// Fetches users that the current user has permission to manage.
export const fetchUsers = async () => {
  const response = await api.get("/manage/users");
  return response.data?.users || response.data || [];
};

// Fetches single user record by ID.
export const fetchUserById = async (id) => {
  const response = await api.get(`/manage/users/${id}`);
  return response.data || null;
};

// Creates a new user with a specific role assignment.
export const createUser = async (payload) => {
  const response = await api.post("/manage/users", payload);
  return response.data?.user || response.data;
};

// Updates an existing user's details or role.
export const updateUser = async ({ id, payload }) => {
  const response = await api.patch(`/manage/users/${id}`, payload);
  return response.data?.user || response.data;
};

// Deletes a user account.
export const deleteUser = async (id) => {
  const response = await api.delete(`/manage/users/${id}`);
  return response.data || {};
};

// Fetches all configured roles for Role Management.
export const fetchRoles = async () => {
  const response = await api.get("/roles");
  return response.data?.roles || response.data || [];
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

// Cancels a booking while keeping the booking record for history.
export const cancelBooking = async (id) => {
  const response = await api.patch(`/booking/${id}/cancel`);
  return response.data?.booking || response.data || {};
};

// Permanently deletes a booking.
export const deleteBooking = async (id) => {
  const response = await api.delete(`/booking/${id}`);
  return response.data || {};
};

export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data?.rooms || response.data || [];
};
export const fetchBookingRooms = async ({ startDate, endDate } = {}) => {
  const params = {};

  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }

  const response = await api.get("/booking/available-rooms", { params });
  return response.data?.rooms || [];
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
  const response = await api.post("/users/subscriptions", { email });
  return response.data || {};
};
