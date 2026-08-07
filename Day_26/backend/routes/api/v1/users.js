const express = require('express');
const router = express.Router();

const {
  createUser,
  listUsers,
  getSingleUser,
  patchUser,
  removeUser,
  login,
  logout,
  getMe,
  refreshToken
} = require('../../../controllers/userController');

const { authenticateToken } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/permission');

const upload = require('../../../middleware/profileUpload')

// Public routes (no auth needed)
router.post('/login', login);
router.post('/logout', logout);
router.post('/', createUser);
router.post("/refresh-token", refreshToken);

// Protected routes (auth required)
router.get('/me', authenticateToken, getMe);

// Viewing the full user list is a permissioned action (managing other users)
router.get('/', authenticateToken, requirePermission('users', 'view'), listUsers);
// Fetching a single user: self-access or 'users' view permission (checked in controller)
router.get('/:id', authenticateToken, getSingleUser);

// Users can update their own profile ('profile' permission), Admin/roles with
// 'users' update permission can update anyone (checked in controller)
router.patch('/:id', authenticateToken,
  (req, res, next) => {
    upload.single('profileImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, patchUser);

// Deleting a user is a permissioned action
router.delete('/:id', authenticateToken, requirePermission('users', 'delete'), removeUser);

module.exports = router;