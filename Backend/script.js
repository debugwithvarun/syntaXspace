import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import ConnectDb from "./connectDB/ConnectDb.js";
import verifyToken from "./middleware/verifyToken.js";
import { setupSocket } from "./socket/socketHandler.js";

import Userrouter from "./routes/User.js";
import Authrouter from "./routes/Auth.js";
import Rcmdrouter from "./routes/Rcmd.js";
import Networkrouter from "./routes/Network.js";
import NewsRouter, { scheduleNewsFetching } from "./routes/News.js";
import PostRouter from "./routes/Post.js";
import { ProfileRouter } from "./routes/Profile.js";
import chatRouter from "./routes/Chat.js";

dotenv.config();

const app = express();

/* ============================
   BASIC MIDDLEWARE
============================ */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ============================
   STATIC FILES
============================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/profilepic",
  express.static(path.join(__dirname, "Public/profilepic"))
);

/* ============================
   DATABASE CONNECTION
============================ */

ConnectDb(process.env.DATABASE_URL);

/* ============================
   ROUTES
============================ */

app.use("/", Userrouter);
app.use("/", verifyToken, Authrouter);
app.use("/", verifyToken, ProfileRouter);
app.use("/", verifyToken, Rcmdrouter);
app.use("/", verifyToken, Networkrouter);
app.use("/", verifyToken, NewsRouter);
app.use("/chat", verifyToken, chatRouter);
app.use("/syntaxspace", verifyToken, PostRouter);

/* ============================
   SOCKET SERVER
============================ */

const server = http.createServer(app);
setupSocket(server);

/* ============================
   START SERVER
============================ */

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ============================
   SCHEDULE JOBS
============================ */

scheduleNewsFetching();