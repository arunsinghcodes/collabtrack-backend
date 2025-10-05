import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetForgotPassword,
  sendEmailVerification,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgetPasswordValidator,
  userRestForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verficationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userForgetPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(userRestForgotPasswordValidator(), validate, resetForgotPassword);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router
  .route("/resend-email-verification")
  .post(verifyJWT, sendEmailVerification);

export default router;
