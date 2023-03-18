import express from "express";
import cors from "cors";
import cParser from "cookie-parser";
import { APP, BUCKET } from "./modules/config/config";
import { errorMiddleware } from "./modules/middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/users.routes";
import { s3 } from "./modules/config/upload";
import { DeleteObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { db } from "./modules/config/db";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(cParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorMiddleware);

const cleanUp = async () => {
  try {
    await db.$transaction([
      db.$queryRaw`set foreign_key_checks=0;`,
      db.user.deleteMany(),
      db.file.deleteMany(),
      db.userProfile.deleteMany(),
      db.userToken.deleteMany(),
    ]);
    const files = await s3.send(
      new ListObjectsCommand({ Bucket: BUCKET.BUCKET_NAME })
    );
    if (files) {
      files.Contents?.forEach(
        async (item) =>
          await s3.send(
            new DeleteObjectCommand({
              Bucket: BUCKET.BUCKET_NAME,
              Key: item.Key,
            })
          )
      );
    }
  } catch (error) {
    console.error(error);
  }
};
const main = async () => {
  app.listen(APP.PORT, () => console.log(`Running On Port: ${APP.PORT}`));
  // await cleanUp();
};
main();
