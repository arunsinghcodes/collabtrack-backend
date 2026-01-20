import mongoose from "mongoose";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json(
    new ApiResponse(200, {
      service: "collabtrack-api",
      status: "healthy",
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
});

export { healthCheck };
