import { async } from "regenerator-runtime";
import userModel from "../models/User";
import videoModel from "../models/Video";
import commentModel from "../models/Comment";

export const home = async (req, res) => {
  const videos = await videoModel.find({}).populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel
    .findById(id)
    .populate("owner")
    .populate("comments");
  return res.render("watch", { pageTitle: "Watch", video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel.findById(id);
  return res.render("edit", { pageTitle: "Edit", video });
};

export const postEdit = async (req, res) => {
  const { title, description, hashtags } = req.body;
  const { id } = req.params;
  await videoModel.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: videoModel.formatHashtags(hashtags),
  });
  return res.redirect("/");
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id: owner },
    },
    body: { title, description, hashtags },
    files: { video, thumb },
  } = req;

  const isHeroku = process.env.NODE_ENV === "production";

  try {
    const newVideo = new videoModel({
      title,
      description,
      hashtags: videoModel.formatHashtags(hashtags),
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
      owner,
    });
    await newVideo.save();

    const user = await userModel.findById(owner);
    await user.videos.push(newVideo);
    await user.save();
  } catch (error) {
    console.log(error);
  }
  return res.redirect("/");
};

export const getDelete = async (req, res) => {
  const { id } = req.params;
  await videoModel.findByIdAndDelete(id);
  res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await videoModel.find({
      title: { $regex: new RegExp(`${keyword}`, "i") },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};

export const updateView = async (req, res) => {
  const { id } = req.params;
  const video = await videoModel.findById(id);
  video.meta.views++;
  await video.save();
  return res.sendStatus(200);
};

export const updateComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const curVideo = await videoModel.findById(id);
  const curUser = await userModel.findById(user._id);
  const comment = await commentModel.create({
    text,
    owner: user._id,
    video: id,
  });

  curVideo.comments.push(comment._id);
  curUser.comments.push(comment._id);

  curVideo.save();
  curUser.save();

  return res.status(200).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const { videoId, commentId } = req.params;
  const { user } = req.session;
  await commentModel.findByIdAndDelete(commentId);

  const curVideo = await videoModel.findById(videoId);
  const curUser = await userModel.findById(user._id);

  const newVideoComment = curVideo.comments.filter(
    (element) => element != commentId
  );
  const newUserComment = curUser.comments.filter(
    (element) => element != commentId
  );

  curVideo.comments = newVideoComment;
  curUser.comments = newUserComment;

  curVideo.save();
  curUser.save();

  return res.sendStatus(200);
};
