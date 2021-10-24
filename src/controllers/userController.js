import bcrypt from "bcrypt";
import userModel from "../models/User";
import videoModel from "../models/Video";
import session from "express-session";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { name, username, password, email, location } = req.body;
  const exists = await userModel.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "already exists",
    });
  }
  await userModel.create({
    name,
    username,
    password,
    email,
    avatarUrl: "",
    location,
  });
  return res.redirect("/login");
};

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username, socialOnly: false });
  if (!user) {
    return res.render("login", {
      pageTitle: "Login",
      errorMessage: "username is wrong",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.render("login", {
      pageTitle: "Login",
      errorMessage: "password is wrong",
    });
  }
  req.session.user = user;
  req.session.loggedIn = true;
  res.redirect("/");
};

export const getLogout = (req, res) => {
  // req.session.user = null;
  // req.session.loggedIn = false;
  req.session.destroy();
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize?";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = baseUrl + params;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token?";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = baseUrl + params;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;

    const userRequest = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailRequest = await (
      await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailRequest.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await userModel.findOne({ email: emailObj.email });

    console.log(userRequest);

    if (!user) {
      user = await userModel.create({
        name: userRequest.name,
        username: userRequest.login,
        avatarUrl: userRequest.avatar_url,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userRequest.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  if (email != req.session.user.email) {
    const exists = await userModel.exists({ email });
    if (exists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "email is aleady exists",
      });
    }
  }

  if (username != req.session.user.username) {
    const exists = await userModel.exists({ username });
    if (exists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "username is aleady exists",
      });
    }
  }

  const updateUser = await userModel.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
      location,
      avatarUrl: file ? file.location : avatarUrl,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  return res.render("change-password", { pageTitle: "change-password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword1, newPassword2 },
  } = req;

  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "change-password",
      errorMessage: "password is wrong",
    });
  }

  if (newPassword1 != newPassword2) {
    return res.status(400).render("change-password", {
      pageTitle: "change-password",
      errorMessage: "new password is missmatch",
    });
  }

  const user = await userModel.findById(_id);
  user.password = newPassword1;
  await user.save();
  req.session.user.password = user.password;
  return res.redirect("/");
};

export const getShowProfile = async (req, res) => {
  const { id } = req.params;
  const videos = await videoModel.find({ owner: id }).populate("owner");
  const user = await userModel.findById(id);
  return res.render("show-profile", {
    pageTitle: "Show Profile",
    user,
    videos,
  });
};
