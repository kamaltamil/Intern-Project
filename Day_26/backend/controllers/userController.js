const {
    registerUser,
    getAllUsers,
    getAllMembers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} = require('../services/userService');

const createUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const result = await registerUser({ name, email, username, password });

        return res.status(201).json({
            message: 'User created successfully',
            ...result,
        });
    } catch (error) {
        const statusCode = error?.code === 11000 || error?.statusCode === 409 ? 409 : 500;

        return res.status(statusCode).json({
            message: statusCode === 409 ? 'User already exists' : 'Error creating user',
            error: error.message,
        });
    }
};

const listUsers = async (req, res) => {
    try {
        const role = req.body?.role || req.user?.role;
        let users;

        if (role === 'Admin') {
            users = await getAllUsers();
        } else if (role === 'Manager') {
            users = await getAllMembers();
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getSingleUser = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.sub;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching current user', error: error.message });
    }
};

const patchUser = async (req, res) => {
    try {
        // Allow user to update their own profile, or Admin to update anyone
        const requestingUserId = req.user?.userId || req.user?.sub;
        const requestingRole = req.user?.role;
        const targetId = req.params.id;

        // Only Admin can change roles
        if (req.body.role && requestingRole !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can change roles' });
        }

        // Non-admin can only update their own profile
        if (requestingRole !== 'Admin' && requestingUserId !== targetId) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }

        const user = await updateUser(targetId, req.body);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const removeUser = async (req, res) => {
    try {
        const deletedUser = await deleteUser(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, email, username, password } = req.body;
        const result = await loginUser({
            identifier: identifier || email || username,
            password,
        });

        return res.status(200).json({
            message: 'Login successful',
            ...result,
        });
    } catch (error) {
        const statusCode = error?.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? 'Invalid credentials' : 'Error logging in',
            error: error.message,
        });
    }
};

const logout = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await logoutUser(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: incomingRefreshToken } = req.body;

        if (!incomingRefreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const result = await refreshAccessToken(incomingRefreshToken);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error?.name === 'TokenExpiredError' ? 401 : 500;
        return res.status(statusCode).json({
            message: 'Unable to refresh token',
            error: error.message,
        });
    }
};

module.exports = {
    createUser,
    listUsers,
    getSingleUser,
    getMe,
    patchUser,
    removeUser,
    login,
    logout,
    refreshToken,
};