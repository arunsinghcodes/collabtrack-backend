import Router from "express"
import { createProject } from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator } from "../validators/index.js";

const router = Router();

// Middlewares verification
router.use(verifyJWT);

router.route("/").post(createProjectValidator(), validate, createProject);

export default router;
