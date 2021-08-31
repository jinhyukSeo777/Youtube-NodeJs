import express from "express";
import {
  updateView,
  updateComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", updateView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", updateComment);
apiRouter.delete(
  "/comments/:videoId([0-9a-f]{24})/:commentId([0-9a-f]{24})",
  deleteComment
);

export default apiRouter;
