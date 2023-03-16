import { RequestHandler } from "express";
import { db } from "../config/db";
import { GetManyUsersModel, UpdateUserModel } from "./users.models";
import {
  hashPassword,
  signUserTokens,
  verifyPassword,
} from "../auth/auth.utils";
import { cookieOptions } from "../auth/auth.controller";

export const updateUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const reqId = req.params.userId;
    const tokenId = (req as any).userId;
    if (reqId !== tokenId) return res.status(403);
    const { password, newPassword, email, ...rest } =
      req.body as UpdateUserModel;
    const foundUser = await db.user.findUnique({
      where: { email },
    });
    if (
      !foundUser ||
      (foundUser && !(await verifyPassword(foundUser.password, password)))
    ) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const userNameValid =
      foundUser.userName === rest.userName ||
      !(await db.user.findUnique({ where: { userName: rest.userName } }));
    if (!userNameValid)
      return res.status(400).json({ message: "User Name In Use" });
    const updatedUser = await db.user.update({
      where: { id: foundUser.id },
      data: {
        ...rest,
        password: newPassword
          ? await hashPassword(newPassword)
          : foundUser.password,
      },
    });
    const { password: dbPass, ...restOfUser } = updatedUser;
    const { accessToken, refreshToken } = signUserTokens({ sub: foundUser.id });
    await db.userToken.update({
      where: { userId: foundUser.id },
      data: {
        token: refreshToken,
      },
    });
    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({ user: restOfUser, accessToken });
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler: RequestHandler = async (req, res, next) => {
  try {
    //Delete tokens, profile, files, contacts, messages, and participants
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const reqId = req.params.userId;
    const foundUser = await db.user.findUnique({ where: { id: reqId } });
    if (!foundUser) return res.status(404).json({ message: "No User Found" });
    const { password, ...rest } = foundUser;
    return res.status(200).json({ user: rest });
  } catch (error) {
    next(error);
  }
};

export const getManyUsersHandler: RequestHandler = async (req, res, next) => {
  const {
    search = "",
    page = "1",
    size = "10",
  } = req.query as GetManyUsersModel;
  const pageNumber = parseInt(page as string);
  const pageSize = parseInt(size as string);
  const skip = Math.max(0, (pageNumber - 1) * pageSize);
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          {
            userName: {
              startsWith: search! as string,
            },
          },
          {
            email: {
              startsWith: search! as string,
            },
          },
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
      skip,
      take: pageSize,
    });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
