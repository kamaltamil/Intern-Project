const express = require("express");

const router = express.Router();

const authRouter = require("./auth");
const usersRouter = require("./users");
const bookingRouter = require("./booking");
const roomsRouter = require("./rooms");
const rolesRouter = require("./roles");

const { authenticateToken } = require("../../../middleware/auth");
const { rateLimiter } = require("../../../config/rateLimiting");

/*
|--------------------------------------------------------------------------
| API v1 Router
|--------------------------------------------------------------------------
|
| /users  → auth routes (login, signup, refresh, profile, logout)
| /manage/users → user CRUD (protected, RBAC)
| /booking → booking routes (protected, RBAC)
| /rooms   → room routes (protected)
| /roles   → role routes (protected, RBAC)
|
|--------------------------------------------------------------------------
*/

// Auth routes (login, signup, refresh, profile, logout)
router.use("/users", authRouter);

// User management CRUD (admin/authorized users)
router.use("/manage/users", rateLimiter, authenticateToken ,usersRouter);

// Booking routes — authenticateToken applied here, permission checked inside
router.use("/booking", rateLimiter, authenticateToken, bookingRouter);

// Room routes
router.use("/rooms",rateLimiter, authenticateToken, roomsRouter);

// Role management routes — authenticateToken applied inside roles.js too
router.use("/roles", rateLimiter ,authenticateToken,rolesRouter);

module.exports = router;
