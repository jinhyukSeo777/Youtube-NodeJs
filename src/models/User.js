import bcrypt from "bcrypt";
import mongoose from "mongoose";
import "regenerator-runtime";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  socialOnly: { type: Boolean, default: false },
  avatarUrl: { type: String },
  username: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String },
  location: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 5);
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
