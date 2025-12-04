import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Task fetched successfully"));
});


const createTask = asyncHandler(async (req, res) =>{
    const {title, description, assignedTo, status} = req.body;
    const {projectId} = req.params;

    const project = await Project.findById(projectId);

    
    return res.status(201).json(201, task, "Task created successfully");
})

export { getProjectTasks };