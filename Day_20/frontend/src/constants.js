/**
 * Centralized domain constants.
 *
 * A single source of truth for values that appear in both the API layer
 * and UI components. Prevents hardcoded magic strings from scattering
 * across multiple files.
 */

export const TASK_PRIORITIES = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export const TASK_STATUSES = [
  { label: "Yet to do", value: "Yet to do" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

export const USER_ROLES = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

export const DEFAULT_PRIORITY = "Medium";
export const DEFAULT_STATUS = "Yet to do";
export const DEFAULT_PAGE_SIZE = 5;
