import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";

import feedRouter from "./routes/feed.js";
import authRouter from "./routes/auth.js";
import error from "./controllers/error.js";
import { cors } from "./utils/cors.js";
import { rootPath } from "./utils/helpers.js";
import { fileFilter, fileStorage } from "./utils/filePicker.js";

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
app.listen(process.env.SERVER_PORT);
