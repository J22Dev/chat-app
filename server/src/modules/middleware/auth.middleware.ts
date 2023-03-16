import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/config";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const bearerToken =
      req.headers.authorization || req.headers["Authorization"];
    if (!bearerToken) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    const token = (bearerToken as string).split(" ")[1];
    const decoded = await new Promise<{ sub: string }>((resolve, reject) => {
      jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
          reject(new Error("Token Not Valid"));
        } else {
          resolve(decoded as { sub: string });
        }
      });
    });
    if ("sub" in decoded) {
      (req as any).userId = decoded.sub;
      next();
    } else {
      return res.status(401).json({ message: "Not Authorized" });
    }
  } catch (error) {
    next(error);
  }
};
