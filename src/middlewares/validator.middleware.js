import { ApiError } from "../utils/api-error.js";
import { validationResult } from "express-validator";

// Middleware to validate the request based on the defined validators
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(422, "Recieved data is not valid", extractedErrors);
};
