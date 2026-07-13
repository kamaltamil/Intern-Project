import axiosInstance from './axiosInstance';

/**
 * Login: queries json-server /users endpoint and validates credentials.
 * Returns a safe user object (no password) on success.
 */
export const loginUser = async ({ email, password }) => {
  const { data } = await axiosInstance.get(`/users?email=${encodeURIComponent(email)}`);

  if (!data || data.length === 0) {
    throw new Error('No account found with that email address.');
  }

  const user = data[0];

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  // Strip password before storing
  const { password: _omit, ...safeUser } = user;
  return safeUser;
};
