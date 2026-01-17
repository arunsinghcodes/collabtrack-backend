import { Router } from "express";
import {
  validateProjectPermission,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/contants.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createNote,
  deleteNote,
  getNote,
  getNoteById,
  updateNote,
} from "../controllers/note.controller.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getNote)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), createNote);

router
  .route("/:projectId/notes/:noteId")
  .get(validateProjectPermission(AvailableUserRoles), getNoteById)
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateNote)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteNote);

export default router;
