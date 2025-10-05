import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/contants.js";

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

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldpassword").notEmpty().withMessage("Old password is required"),
    body("newpassword").notEmpty().withMessage("New password is required"),
  ];
};

const userForgetPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userRestForgotPasswordValidator = () => {
  return [body("password").notEmpty().withMessage("password is required")];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgetPasswordValidator,
  userForgetPasswordValidator,
  userRestForgotPasswordValidator,
};
