const { body, param, query } = require("express-validator");

const validateCreateTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .escape(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .escape(),

  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),

  body("status")
    .optional()
    .isIn(["Yet to do", "In Progress", "Completed"])
    .withMessage("Status must be Yet to do, In Progress, or Completed"),
];

const validateUpdateTask = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .escape(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .escape(),

  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),

  body("status")
    .optional()
    .isIn(["Yet to do", "In Progress", "Completed"])
    .withMessage("Status must be Yet to do, In Progress, or Completed"),
];

const validateTaskId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid task ID format"),
];

const validateTaskQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQuery,
};
