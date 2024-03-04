import { body } from "express-validator";

export const postValidation = [
  body("title").trim().isLength({ min: 5 }),
  body("content").trim().isLength({ min: 5 }),
];

export const statusValidation = [body("status").trim().not().isEmpty()];

export default {
  postValidation,
  statusValidation,
};
