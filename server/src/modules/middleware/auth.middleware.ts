import { RequestHandler } from "express";
import { verifyUserToken } from "../auth/auth.utils";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const bearerToken =
      req.headers.authorization || req.headers["Authorization"];
    if (!bearerToken) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const token = (bearerToken as string).split(" ")[1];
    const decoded = await verifyUserToken({ type: "ACCESS", payload: token });
    if (!decoded) return res.status(401).json({ message: "Not Authorized" });
    if ("sub" in decoded) {
      (req as any).userId = decoded.sub;
      next();
    }
  } catch (error) {
    next(error);
  }
};
