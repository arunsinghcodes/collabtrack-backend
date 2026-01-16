import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";
import { createTask, getProjectTasks, getTaskById } from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectTasks)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), validate, createTask);


router
.route("/:projectId/tasks/:taskId")
.get(validateProjectPermission(AvailableUserRoles), getTaskById)



export default router;