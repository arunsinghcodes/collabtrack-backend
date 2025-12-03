import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles } from "../utils/contants.js";
import { getProjectTasks } from "../controllers/task.controller.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectTasks);


export default router;