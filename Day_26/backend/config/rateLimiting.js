const rateLimit = require('express-rate-limit')

const createLimiter = (windowMs, max, message) => (
 rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message });
    },
})
)


const rateLimiter = createLimiter(
    4 * 60 * 1000,
    6,
    "Too many attempts, Please try again"
)

module.exports = {
    rateLimiter
};