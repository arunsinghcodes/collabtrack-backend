import mongoose, { Mongoose } from "mongoose";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  
  return res
    .staus(201)
    .json(new ApiResponse(201, tasks, "Notes fetched successfully"));
});

const createNote = asyncHandler(async (req, res) => {
  // create Notes
});

const getNoteById = asyncHandler(async (req, res) => {
  // getNote by Id
});

const updateNote = asyncHandler(async (req, res) => {
  // update note controller
});

const deleteNote = asyncHandler(async (req, res) => {
  // delete Note controller
});

export { getNote, createNote, getNoteById, updateNote, deleteNote };
