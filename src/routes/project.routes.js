import Router from "express";
import {
  createProject,
  getProjectById,
  getProjects,
} from "../controllers/project.controller.js";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator } from "../validators/index.js";
import { AvailableUserRoles } from "../utils/contants.js";

const router = Router();

// Middlewares verification
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectById);

export default router;
