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
  refreshToken,
} = require('../../../controllers/userController');

const { authenticateToken, requireRole } = require('../../../middleware/auth');

// Public routes (no auth needed)
router.post('/login', login);
router.post('/logout', logout);
router.post('/', createUser);
router.post("/refresh-token", refreshToken);

// Protected routes (auth required)
router.get('/me', authenticateToken, getMe);

router.get('/', authenticateToken, listUsers);
router.get('/:id', authenticateToken, getSingleUser);

// Only authenticated users can update their own profile, Admin can update anyone
router.patch('/:id', authenticateToken, patchUser);

// Admin only - delete user
router.delete('/:id', authenticateToken, requireRole('Admin'), removeUser);

module.exports = router;