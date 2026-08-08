import api from "./api";

/* -------------------------------------------------------------------------- */
/*                              Auth Queries                                  */
/* -------------------------------------------------------------------------- */

/**
 * Login user
 * POST /users/login
 * Returns: { user, token, refreshToken, role, permissions }
 */
export const loginUser = async (payload) => {
  const response = await api.post("/users/login", payload);
  return response.data || {};
};

/**
 * Public signup (assigns default role from DB)
 * POST /users/signup
 * Returns: { user }
 */
export const signupUser = async (payload) => {
  const response = await api.post("/users/signup", payload);
  return response.data || {};
};

/**
 * Logout
 * POST /users/logout
 */
export const logoutUser = async () => {
  const response = await api.post("/users/logout");
  return response.data || {};
};

/**
 * Get current user's profile
 * GET /users/profile
 * Returns: { user, role, permissions }
 */
export const fetchMe = async () => {
  const response = await api.get("/users/profile");
  return response.data || {};
};

/**
 * Refresh access token
 * POST /users/refresh
 * Returns: { token, refreshToken, role, permissions }
 */
export const refreshToken = async (payload) => {
  const response = await api.post("/users/refresh", payload);
  return response.data || {};
};

/* -------------------------------------------------------------------------- */
/*                              User Management                               */
/* -------------------------------------------------------------------------- */

/**
 * Get all users
 * GET /manage/users
 * Requires: users.view
 */
export const fetchUsers = async () => {
  const response = await api.get("/manage/users");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get user by ID
 * GET /manage/users/:id
 * Requires: users.view
 */
export const fetchUserById = async (id) => {
  const response = await api.get(`/manage/users/${id}`);
  return response.data || null;
};

/**
 * Admin creates a new user with explicit role
 * POST /manage/users
 * Requires: users.create
 * Payload: { name, email, username, password, role }
 */
export const createUser = async (payload) => {
  const response = await api.post("/manage/users", payload);
  return response.data?.user || response.data;
};

/**
 * Update user
 * PATCH /manage/users/:id
 * Requires: users.update
 * Payload: { name?, email?, username?, password?, role?, isActive? }
 */
export const updateUser = async ({ id, payload }) => {
  const response = await api.patch(`/manage/users/${id}`, payload);
  return response.data?.user || response.data;
};

/**
 * Delete user
 * DELETE /manage/users/:id
 * Requires: users.delete
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/manage/users/${id}`);
  return response.data || {};
};

/* -------------------------------------------------------------------------- */
/*                              Role Management                               */
/* -------------------------------------------------------------------------- */

/**
 * Get all roles (full documents with permissions)
 * GET /roles
 * Requires: roles.view
 */
export const fetchRoles = async () => {
  const response = await api.get("/roles");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get single role by ID
 * GET /roles/:id
 * Requires: roles.view
 */
export const fetchRoleById = async (id) => {
  const response = await api.get(`/roles/${id}`);
  return response.data || null;
};

/**
 * Create role
 * POST /roles
 * Requires: roles.create
 * Payload: { name, description, color, permissions, isDefault? }
 */
export const createRole = async (payload) => {
  const response = await api.post("/roles", payload);
  return response.data?.role || response.data;
};

/**
 * Update role
 * PATCH /roles/:id
 * Requires: roles.update
 * Payload: { name?, description?, color?, permissions?, isDefault? }
 */
export const updateRole = async ({ id, payload }) => {
  const response = await api.patch(`/roles/${id}`, payload);
  return response.data?.role || response.data;
};

/**
 * Delete role
 * DELETE /roles/:id
 * Requires: roles.delete
 */
export const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data || {};
};

/* -------------------------------------------------------------------------- */
/*                              Booking Queries                               */
/* -------------------------------------------------------------------------- */

/**
 * Get all bookings
 * GET /booking
 * Requires: bookings.view
 */
export const fetchBookings = async () => {
  const response = await api.get("/booking");
  return response.data?.bookings || response.data || [];
};

/**
 * Create booking
 * POST /booking/new
 * Requires: bookings.create
 */
export const createBooking = async (payload) => {
  const response = await api.post("/booking/new", payload);
  return response.data || {};
};

/* -------------------------------------------------------------------------- */
/*                              Room Queries                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get all rooms
 * GET /rooms
 */
export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data?.rooms || response.data || [];
};