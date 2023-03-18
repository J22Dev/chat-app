import { Router } from "express";
import { upload } from "../config/upload";
import {
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  updateUserHandler,
} from "./users.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { valMiddleware } from "../middleware/validation.middleware";
import { getUsersModel } from "./users.models";

export const userRouter = Router();

userRouter
  .put("/:userId", authMiddleware, upload.single("avatar"), updateUserHandler)
  .delete("/:userId", authMiddleware, deleteUserHandler)
  .get("/:userId", authMiddleware, getUserByIdHandler)
  .get("/", authMiddleware, valMiddleware(getUsersModel), getUsersHandler);
