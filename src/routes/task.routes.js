import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";
import { getProjectTasks } from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectTasks)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), validate, createTask)


export default router;