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
import {
  createUserProfileHandler,
  deleteUserProfileHandler,
  getUserProfileHandler,
  updateUserProfileHandler,
} from "./profiles/profiles.controller";

export const userRouter = Router();

userRouter
  .put("/:userId", authMiddleware, updateUserHandler)
  .delete("/:userId", authMiddleware, deleteUserHandler)
  .get("/:userId", authMiddleware, getUserByIdHandler)
  .get("/", authMiddleware, valMiddleware(getUsersModel), getUsersHandler)
  .post(
    "/:userId/profile",
    authMiddleware,
    upload.single("avatar"),
    createUserProfileHandler
  )
  .put(
    "/:userId/profile",
    authMiddleware,
    upload.single("avatar"),
    updateUserProfileHandler
  )
  .delete("/:userId/profile", authMiddleware, deleteUserProfileHandler)
  .get("/:userId/profile", authMiddleware, getUserProfileHandler);
