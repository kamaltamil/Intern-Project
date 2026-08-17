const express = require("express");

const router = express.Router();

const openApiRouter = require("./openApi");
const authRouter = require("./auth");
const usersRouter = require("./users");
const bookingRouter = require("./booking");
const roomsRouter = require("./rooms");
const rolesRouter = require("./roles");
const approvalRouter = require("./approval");
const reportsRouter = require("./reports");
const subscriptionsRouter = require("./subscriptions");

const { authenticateToken } = require("../../../middleware/auth");
const { rateLimiter } = require("../../../config/rateLimiting");


// Public APIs
router.use("/users", openApiRouter);


// Authenticated api
router.use(rateLimiter)
router.use(authenticateToken)

router.use("/users", authRouter);
router.use("/manage/users", usersRouter);
router.use("/booking", bookingRouter);
router.use("/rooms", roomsRouter);
router.use("/roles", rolesRouter);
router.use("/approval", approvalRouter);
router.use("/reports", reportsRouter);

module.exports = router;
