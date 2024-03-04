import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import { createServer } from "http";

import feedRouter from "./routes/feed.js";
import authRouter from "./routes/auth.js";
import error from "./controllers/error.js";
import { cors } from "./utils/cors.js";
import { rootPath } from "./utils/helpers.js";
import { fileFilter, fileStorage } from "./utils/filePicker.js";
import Io from "./socket.js";

const app = express();
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(rootPath("images")));
app.use(cors);
await mongoose.connect(process.env.MONGO_URI);

app.use("/feed", feedRouter);
app.use("/auth", authRouter);
app.use(error.handleError);

const httpServer = createServer(app);
const io = Io.init(httpServer);
io.on("connection", (socket) => {
  console.log("Client connected");
});

httpServer.listen(process.env.SERVER_PORT);
