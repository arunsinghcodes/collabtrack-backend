import mongoose from "mongoose";
import { ProjectMember } from "../models/projectmember.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId || projectId.trim() === "") {
      throw new ApiError(400, "Project ID is missing");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid project ID");
    }

    const projectMember = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!projectMember) {
      throw new ApiError(404, "Project not found or access denied");
    }

    req.user.role = projectMember.role;

    if (!roles.includes(projectMember.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }

    next();
  });
};
