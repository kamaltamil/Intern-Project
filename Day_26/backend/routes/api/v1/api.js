const express = require("express");

const router = express.Router();

const authRouter = require("./auth");
const usersRouter = require("./users");
const bookingRouter = require("./booking");
const roomsRouter = require("./rooms");
const rolesRouter = require("./roles");
const approvalRouter = require("./approval");
const reportsRouter = require("./reports");

const { authenticateToken } = require("../../../middleware/auth");
const { rateLimiter } = require("../../../config/rateLimiting");

router.use("/users", authRouter);
router.use("/manage/users", rateLimiter, authenticateToken, usersRouter);
router.use("/booking", rateLimiter, authenticateToken, bookingRouter);
router.use("/rooms", rateLimiter, authenticateToken, roomsRouter);
router.use("/roles", rateLimiter, authenticateToken, rolesRouter);
router.use("/approval", rateLimiter, authenticateToken, approvalRouter);
router.use("/reports", rateLimiter, authenticateToken, reportsRouter);

module.exports = router;
