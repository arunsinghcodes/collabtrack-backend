import express from "express";
import cors from "cors";
// for parsing cookies
import cookieParser from "cookie-parser";

const app = express();

// Basic configuration
// limit the size of incoming JSON and URL-encoded payloads to 16kb
app.use(express.json({ limit: "16kb" }));
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// serve static files from the "public" directory
app.use(express.static("public"));
// parse cookies
app.use(cookieParser());

// handling cookie

app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// import the routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import { ApiError } from "./utils/api-error.js";

app.use("/api/v1/healthcheck", healthCheckRouter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err); // optional: logs the error in console

  if (err instanceof ApiError) {
    // If it's an ApiError, respond using its fields
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      message: err.message,
      data: err.data,
      errors: err.errors,
    });
  }

  // For unexpected errors
  res.status(500).json({
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    errors: [],
  });
});


app.get("/", (req, res) => {
    res.status(200).send("This home for collab track backend servcies 😎")
  console.log("Welcome to Collab Track API's end points");
});

export default app;
