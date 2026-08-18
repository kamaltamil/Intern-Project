const { body, param } = require("express-validator");

// Validate the basic role fields before the service handles permission rules.
const createRolePayload = [
  body("name").trim().notEmpty().withMessage("Role name is required"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array"),
  body("manageableRoles")
    .optional()
    .isArray()
    .withMessage("Manageable roles must be an array"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("color").optional().isString().withMessage("Color must be a string"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean"),
  body("dashboardConfig")
    .optional()
    .isObject()
    .withMessage("Dashboard configuration must be an object"),
];

const updateRolePayload = [
  param("id").isMongoId().withMessage("Invalid role ID"),
  body("name").optional().trim().notEmpty().withMessage("Role name cannot be empty"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array"),
  body("manageableRoles")
    .optional()
    .isArray()
    .withMessage("Manageable roles must be an array"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("color").optional().isString().withMessage("Color must be a string"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean"),
  body("dashboardConfig")
    .optional()
    .isObject()
    .withMessage("Dashboard configuration must be an object"),
];

const roleIdPayload = [param("id").isMongoId().withMessage("Invalid role ID")];

module.exports = { createRolePayload, updateRolePayload, roleIdPayload };
