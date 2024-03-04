export const handleError = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "An unknown error occurred!";
  const data = err.data || [];
  res.status(status).json({ message, data });
};

export default {
  handleError,
};
