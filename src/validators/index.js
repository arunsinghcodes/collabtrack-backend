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

export { userRegisterValidator };
