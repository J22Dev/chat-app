import { RequestHandler } from "express";
import { db } from "../config/db";
import {
  hashPassword,
  signUserTokens,
  verifyPassword,
} from "../auth/auth.utils";
import { GetUsersModel, UserUpdateModel } from "./users.models";
import { BUCKET, COOKIE_OPTIONS } from "../config/config";

export const deleteUserHandler: RequestHandler = async (req, res, next) => {};

export const updateUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const requesterId = (req as any).userId;
    const userId = req.params.userId;
    if (userId !== requesterId)
      return res.status(403).json({ message: "Forbidden" });
    const foundUser = await db.user.findUnique({ where: { id: userId } });
    if (!foundUser) return res.status(403);
    const { password, ...rest } = foundUser;
    const userData = req.body as UserUpdateModel;
    const isPassValid = await verifyPassword(password, userData.password);
    if (!isPassValid)
      return res.status(401).json({ message: "Not Authorized" });
    const hashedPassword = userData.newPassword
      ? await hashPassword(userData.newPassword)
      : password;
    const validEmail =
      foundUser.email === userData.email ||
      !(await db.user.findFirst({ where: { email: userData.email } }));
    const validUserName =
      foundUser.userName === userData.userName ||
      !(await db.user.findFirst({ where: { userName: userData.userName } }));
    if (!validEmail || !validUserName) {
      return res
        .status(400)
        .json({ message: !validEmail ? "Email In Use" : "User Name In Use" });
    }
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { ...userData, password: hashedPassword },
    });
    const { password: uPass, ...user } = updatedUser;
    const { accessToken, refreshToken } = signUserTokens({ sub: foundUser.id });
    await db.userToken.update({
      where: { userId },
      data: { token: refreshToken },
    });
    return res
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .status(200)
      .json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const foundUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userName: true,
        dateCreated: true,
        dateUpdated: true,
      },
    });
    if (!foundUser) return res.status(404).json({ message: "User Not Found" });
    return res.status(200).json(foundUser);
  } catch (error) {
    next(error);
  }
};
export const getUsersHandler: RequestHandler = async (req, res, next) => {
  try {
    const { query, page, size } = req.query as GetUsersModel;
    const skip = (parseInt(page) - 1) * parseInt(size);
    const foundUsers = await db.user.findMany({
      where: {
        OR: [
          { userName: { startsWith: query } },
          { email: { startsWith: query } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userName: true,
        dateCreated: true,
        dateUpdated: true,
      },
      take: parseInt(size),
      skip,
    });
    return res.status(200).json([...foundUsers]);
  } catch (error) {
    next(error);
  }
};
