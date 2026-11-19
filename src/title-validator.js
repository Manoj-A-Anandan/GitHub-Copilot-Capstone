export const REQUIRED_TITLE_MESSAGE = "Task title is required and cannot be empty.";
export const OVERLENGTH_TITLE_MESSAGE = "Task title must be 255 characters or fewer.";

export function validateTitle(title) {
  if (typeof title !== "string" || title.trim().length === 0) {
    return { valid: false, message: REQUIRED_TITLE_MESSAGE };
  }
  if (Array.from(title).length > 255) {
    return { valid: false, message: OVERLENGTH_TITLE_MESSAGE };
  }
  return { valid: true, title };
}
