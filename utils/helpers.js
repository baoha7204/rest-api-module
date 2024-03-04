import path from "path";
import fs from "fs";

export const rootPath = (...paths) => {
  return path.join(process.cwd(), ...paths);
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const deleteFile = (filePath, next) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      next(err);
    }
  });
};
