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

const { hasPermission } = require('../services/permissionService');

const createUser = async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            role
        } = req.body;
        const result = await registerUser({ name, email, username, password, role});

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
        // Route already confirmed the caller has 'users:view'. Roles that can also
        // delete users (full user management, e.g. Admin) see everyone; roles with
        // view-only access (e.g. Manager) see the member roster.
        const canManageUsers = req.permissions?.users?.delete;
        const users = canManageUsers ? await getAllUsers() : await getAllMembers();

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getSingleUser = async (req, res) => {
    try {
        const requestedId = req.params.id;
        const requestingUserId = req.user?.userId || req.user?.sub;
        const isSelf = requestingUserId === requestedId;

        // Viewing your own record needs 'profile:view'; viewing someone else's
        // needs 'users:view' — both are permissions an Admin assigns per role.
        const allowed = isSelf
            ? await hasPermission(req.user?.role, 'profile', 'view')
            : await hasPermission(req.user?.role, 'users', 'view');

        if (!allowed) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await getUserById(requestedId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.profileImage && process.env.BASE_URL) {
            user.profileImage = `${process.env.BASE_URL}${user.profileImage}`;
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
        const requestingUserId = req.user?.userId || req.user?.sub;
        const targetId = req.params.id;
        const isSelf = requestingUserId === targetId;

        // Updating your own profile needs 'profile:update'; updating someone
        // else's needs 'users:update' — both configurable per role by an Admin.
        const allowed = isSelf
            ? await hasPermission(req.user?.role, 'profile', 'update')
            : await hasPermission(req.user?.role, 'users', 'update');

        if (!allowed) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Reassigning a user's role is a role-management action
        if (req.body.role && !(await hasPermission(req.user?.role, 'roles', 'update'))) {
            return res.status(403).json({ message: 'You do not have permission to change roles' });
        }

        if (req.file) {
            req.body.profileImage = `/uploads/profile/${req.file.filename}`;
        }
        const user = await updateUser(targetId, req.body);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.profileImage && process.env.BASE_URL) {
            user.profileImage = `${process.env.BASE_URL}${user.profileImage}`;
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