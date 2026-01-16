import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getProjectTasks,
  getSubtasksByTask,
  getTaskById,
  updateSubTask,
  updateTask,
} from "../controllers/task.controller.js";
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
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), validate, updateTask)
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    validate,
    deleteTask
  );

router
  .route("/:projectId/tasks/:taskId/subtasks")
  .get(validateProjectPermission(AvailableUserRoles), getSubtasksByTask)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), createSubTask);

router
  .route("/:projectId/subtasks/:subTaskId")
  .put(validateProjectPermission(AvailableUserRoles), updateSubTask);

router
  .route("/:projectId/subtasks/:subTaskId")
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteSubTask);

export default router;