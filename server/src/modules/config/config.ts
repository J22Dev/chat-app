import dotenv from "dotenv";
dotenv.config();

export const { JWT, APP, BUCKET, COOKIE_OPTIONS } = {
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  },
  APP: {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: parseInt(process.env.PORT as string),
  },
  BUCKET: {
    BUCKET_NAME: process.env.BUCKET_NAME as string,
    BUCKET_ACCESS_KEY: process.env.BUCKET_ACCESS_KEY as string,
    BUCKET_SECRET_KEY: process.env.BUCKET_SECRET_KEY as string,
    BUCKET_REGION: process.env.BUCKET_REGION as string,
    BUCKET_ENDPOINT: process.env.BUCKET_ENDPOINT as string,
  },
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000, // 7 days - 1 hour
  },
};
