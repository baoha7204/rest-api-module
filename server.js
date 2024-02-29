import express from "express";
import bodyParser from "body-parser";

import feedRouter from "./routes/feed";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/feed", feedRouter);

app.listen(process.env.SERVER_PORT);
