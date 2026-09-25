const { UnauthorizedError } = require("../errors/AppError");
const { verifyAccessToken } = require("../utils/jwt");

// Attaches req.user = { id, role } from a valid Bearer access token.
const requireAuth = (req, _res, next) => {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;
