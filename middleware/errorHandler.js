const { AppError } = require("../errors/AppError");

const notFoundHandler = (_req, res) =>
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, ...(err.details && { details: err.details }) },
    });
  }

  // Malformed JSON body etc. from body-parser
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { message: "Malformed JSON", code: "BAD_REQUEST" } });
  }

  // Log the error itself (name + message), never request headers/bodies,
  // which could contain tokens or passwords.
  console.error(`${err.name}: ${err.message}`);
  res.status(500).json({ error: { message: "Internal server error", code: "INTERNAL_ERROR" } });
};

module.exports = { notFoundHandler, errorHandler };
