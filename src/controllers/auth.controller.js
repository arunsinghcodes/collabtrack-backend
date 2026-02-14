import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Function to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    //  find the user from database
    const user = await User.findById(userId);

    // if user not found, throw an error
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    // generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save the refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

// Controller to registering a user
const registerUser = asyncHandler(async (req, res) => {
  // extract the required fields from request body
  const { email, username, password, role } = req.body;

  // check if user with email or username already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // if exists, throw an error
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  // create a new user
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  // generate email verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  console.log(
    `unHashedToken : ${unHashedToken}, hashedToken : ${hashedToken}, tokenExpiry:  ${tokenExpiry}`
  );

  // save the email verification token and expiry to user document
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  // save the user
  await user.save({ validateBeforeSave: false });

  // send verification email to user
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${unHashedToken}`
    ),
  });

  // fetch the created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // if user creation failed, throw an error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  // respond with success message
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email"
      )
    );
});

// Controller to login user
const login = asyncHandler(async (req, res) => {
  // extract email and password from request body
  const { email, password } = req.body;

  // validate email and password presence
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // find the user by email
  const user = await User.findOne({ email });

  // if user not found, throw an error
  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  // validate the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  // if password is invalid, throw an error
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  // generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // fetch the logged in user without sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // set tokens in http only cookies and respond with success message
  const options = {
  httpOnly: true,
  secure: true,            // must be true for SameSite=None
  sameSite: "none",        // 🔥 THIS FIXES YOUR ISSUE
  path: "/",
};

  // respond with tokens and user info
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged in successfully"
      )
    );
});

// Controller to logout user
const logoutUser = asyncHandler(async (req, res, next) => {
  // clear the refresh token in database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  // clear the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // respond with success message
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// Controller to get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Controller to verify email
const verifyEmail = asyncHandler(async (req, res) => {
  // extract the verification token from request params
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth/verify/error`);
  }

  // hash the token
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // find the user with the hashed token and valid expiry
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  // if user not found, throw an error
  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL}/verify/error`);
  }

  // update user to mark email as verified
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  // respond with success message
  return res.redirect(`${process.env.FRONTEND_URL}/verify/success`);
});

// Controller to resend email verification
const sendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  // if user not found, throw an error
  if (!user) {
    throw new ApiError(404, "User does not exists!");
  }

  // if email is already verified, throw an error
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  // generate email verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  console.log(
    `unHashedToken : ${unHashedToken}, hashedToken : ${hashedToken}, tokenExpiry:  ${tokenExpiry}`
  );

  // save the email verification token and expiry to user document
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  // save the user
  await user.save({ validateBeforeSave: false });

  // send verification email to user
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${unHashedToken}`
    ),
  });

  // respond with success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your email Id"));
});

// Controller to refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  // extract the refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // if refresh token is missing, throw an error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  // verify the refresh token
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // find the user from database
    const user = await User.findById(decodedToken?._id);

    // if user not found, throw an error
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if the incoming refresh token matches the stored refresh token
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh toekn in expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    // generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    // respond with new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refreh token");
  }
  return {};
});

//  Controller to handle forgot password request
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  //  extract email from request body
  const { email } = req.body;
  // find the user by email
  const user = await User.findOne({ email });

  // if user not found, throw an error
  if (!user) {
    throw new ApiError(404, "User does not exist", []);
  }

  // generate temporary token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // save the forgot password token and expiry to user document
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  // save the user
  await user.save({ validateBeforeSave: false });

  // send forgot password email
  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGET_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

  // respond with success message
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    );
});

// Controller to reset forgot password
const resetForgotPassword = asyncHandler(async (req, res) => {
  // extract reset token from request params and new password from request body
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  // if reset token is missing, throw an error
  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // find user with matching token and valid expiry
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  // if user not found, throw an error
  if (!user) {
    throw new ApiError(409, "Token is invalid or expired");
  }

  // update the password
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // set the new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // respond with success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

// Controller to change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // extract old and new passwords from request body
  const { oldPassword, newPassword } = req.body;

  // find the user from database
  const user = await User.findById(req.user?._id);

  // validate old password
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  // if old password is incorrect, throw an error
  if (!isPasswordValid) {
    throw ApiError(400, "Invalid old password");
  }

  // update the password to new password
  user.password = newPassword;

  // save the user
  await user.save({ validateBeforeSave: false });

  // respond with success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password chnaged successfully"));
});

// export all controllers
export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  sendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
