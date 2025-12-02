import Router from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator } from "../validators/index.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";

const router = Router();

// Middlewares verification
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router.route("/:projectId/members").get(getProjectMembers);

export default router;
