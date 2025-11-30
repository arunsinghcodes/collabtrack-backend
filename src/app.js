import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
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

app.use("/api/v1/healthcheck", healthCheckRouter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter)

app.get("/", (req, res) => {
    res.status(200).send("This home for collab track backend servcies 😎")
  console.log("Welcome to Collab Track API's end points");
});

export default app;
