import { Router } from "express";
import {
  loginUserHandler,
  refreshUserHandler,
  registerUserHandler,
} from "./auth.controller";
import { valMiddleware } from "../middleware/validation.middleware";
import { loginUserModel, registerUserModel } from "./auth.models";

export const authRouter = Router();

authRouter
  .post("/register", valMiddleware(registerUserModel), registerUserHandler)
  .post("/login", valMiddleware(loginUserModel), loginUserHandler)
  .get("/refresh", refreshUserHandler);
