import { Router } from "express";
import {
  getManyUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
} from "./users.controller";
import { valMiddleware } from "../middleware/validation.middleware";
import {
  getManyUsersModel,
  getUserByIdModel,
  updateUserModel,
} from "./users.models";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter
  .put(
    "/:userId",
    authMiddleware,
    valMiddleware(updateUserModel),
    updateUserHandler
  )
  .get(
    "/:userId",
    authMiddleware,
    valMiddleware(getUserByIdModel),
    getUserByIdHandler
  )
  .get(
    "/",
    authMiddleware,
    valMiddleware(getManyUsersModel),
    getManyUsersHandler
  )
  .delete("/:userId")
  .post("/:userId/profile")
  .put("/:userId/profile")
  .get("/:userId/profile")
  .delete("/:userId/profile");
