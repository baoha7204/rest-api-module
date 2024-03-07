import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import expressPlayground from "graphql-playground-middleware-express";

import error from "./controllers/error.js";
import { cors } from "./utils/cors.js";
import { asyncHandler, deleteFile, rootPath } from "./utils/helpers.js";
import { fileFilter, fileStorage } from "./utils/filePicker.js";
import { graphqlHandler } from "./graphql/config.js";
import { auth } from "./middlewares/is-auth.js";

const app = express();
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(rootPath("images")));
app.use(cors);
app.use(asyncHandler(auth));
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.status = 401;
    throw error;
  }
  const file = req.file;
  if (!file) {
    return res.status(200).json({ message: "No file provided." });
  }
  if (req.body.oldPath) {
    deleteFile(req.body.oldPath, next);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: file.path.replace("\\", "/") });
});
app.use("/graphql", graphqlHandler);
app.get("/playground", expressPlayground.default({ endpoint: "/graphql" }));

await mongoose.connect(process.env.MONGO_URI);

app.use(error.handleError);
app.listen(process.env.SERVER_PORT);
