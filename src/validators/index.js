import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/contants.js";

// Validator for user registration mean to validate the incoming request body
const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email in invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("fullName").optional().trim(),
  ];
};

// Validator for user login to validate the incoming request body
const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

// Validator for changing current password
const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldpassword").notEmpty().withMessage("Old password is required"),
    body("newpassword").notEmpty().withMessage("New password is required"),
  ];
};

// Validator for forgot password
const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

// Validator for reset forgot password
const userRestForgotPasswordValidator = () => {
  return [body("password").notEmpty().withMessage("password is required")];
};

// Validator for creating a project
const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("Project is required"),
    body("description").optional(),
  ];
};

// Validator for adding member to project
const addMembertoProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Role is invalid"),
  ];
};

// export all validators
export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userRestForgotPasswordValidator,
  createProjectValidator,
  addMembertoProjectValidator,
};
