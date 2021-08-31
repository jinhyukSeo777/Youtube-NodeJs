import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import "regenerator-runtime";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import mongoStore from "connect-mongo";
import apiRouter from "./routers/apiRouter";
import flash from "express-flash";

const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(flash());
app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

app.get("/");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log("✅ Server Start"));
