import jwt from "jsonwebtoken";
import argon from "argon2";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config/config";

export const hashPassword = (pass: string) => argon.hash(pass);
export const verifyPassword = (hash: string, plain: string) =>
  argon.verify(hash, plain);

type TokenType = "ACCESS" | "REFRESH";
type TokenPayload = { sub: string } & Record<string, string>;
type SignTokenPayload = { type: TokenType; payload: TokenPayload };

export const getTokenConfig = (type: TokenType) => {
  return type === "ACCESS"
    ? { expiresIn: "15m", secret: JWT_ACCESS_SECRET }
    : { secret: JWT_REFRESH_SECRET, expiresIn: "7d" };
};

export const signToken = ({ type, payload }: SignTokenPayload) => {
  const { secret, expiresIn } = getTokenConfig(type);
  return jwt.sign(payload, secret, { expiresIn });
};

export const signUserTokens = (payload: TokenPayload) => {
  return {
    accessToken: signToken({ type: "ACCESS", payload }),
    refreshToken: signToken({ type: "REFRESH", payload }),
  };
};

export const verifyUserToken = ({
  type,
  payload,
}: {
  type: TokenType;
  payload: string;
}): Promise<false | TokenPayload> => {
  return new Promise((res, rej) => {
    jwt.verify(payload, getTokenConfig(type).secret, (err, decoded) => {
      if (err) res(false);
      res(decoded as TokenPayload);
    });
  });
};
