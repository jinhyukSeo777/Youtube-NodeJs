import express from "express";
import {
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
  getShowProfile,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  imgUploadMiddleware,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter
  .route("/edit-profile")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(imgUploadMiddleware.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.route("/:id([0-9a-f]{24})").get(getShowProfile);

export default userRouter;
