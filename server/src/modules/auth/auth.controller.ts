import { RequestHandler } from "express";
import { db } from "../config/db";
import { LoginUserModel, RegisterUserModel } from "./auth.models";
import {
  hashPassword,
  signUserTokens,
  verifyPassword,
  verifyUserToken,
} from "./auth.utils";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000, // 7 days - 1 hour
};

export const registerUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userData = req.body as RegisterUserModel;
    const foundUser = await db.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { userName: userData.userName }],
      },
    });
    if (foundUser) {
      return res.status(400).json({
        message:
          foundUser.email === userData.email
            ? "Email In Use"
            : "User Name In Use",
      });
    }
    const hashedPassword = await hashPassword(userData.password);
    const newUser = await db.user.create({
      data: { ...userData, password: hashedPassword },
    });
    const { password, ...rest } = newUser;
    const { accessToken, refreshToken } = signUserTokens({ sub: newUser.id });
    await db.userToken.create({
      data: {
        userId: newUser.id,
        token: refreshToken,
      },
    });
    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201)
      .json({ user: rest, accessToken });
  } catch (error) {
    next(error);
  }
};

export const loginUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userData = req.body as LoginUserModel;
    const foundUser = await db.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (!foundUser) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }
    const passwordValid = await verifyPassword(
      foundUser.password,
      userData.password
    );
    if (!passwordValid)
      return res.status(401).json({ message: "Not Authorized" });

    const { accessToken, refreshToken } = signUserTokens({ sub: foundUser.id });
    await db.userToken.update({
      where: { userId: foundUser.id },
      data: {
        token: refreshToken,
      },
    });
    const { password, ...rest } = foundUser;
    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({ user: rest, accessToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const refreshUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Not Authorized" });
    const decoded = await verifyUserToken({ type: "REFRESH", payload: token });
    if (!decoded) return res.status(401).json({ message: "Not Authorized" });
    const foundUser = await db.user.findUnique({ where: { id: decoded.sub } });
    if (!foundUser) return res.status(403);
    const { password, ...rest } = foundUser;
    const { accessToken } = signUserTokens({ sub: foundUser.id });
    return res.status(200).json({ user: rest, accessToken });
  } catch (error) {
    next(error);
  }
};
