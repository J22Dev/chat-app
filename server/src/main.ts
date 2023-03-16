import express from "express";
import cors from "cors";
import cParser from "cookie-parser";
import { PORT } from "./modules/config/config";
import { errorMiddleware } from "./modules/middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/users.routes";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(cParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use(errorMiddleware);

const main = async () => {
  app.listen(PORT, () => console.log(`Running On Port: ${PORT}`));
};
main();
