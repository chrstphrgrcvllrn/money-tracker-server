// The only file that imports jsonwebtoken.
const jwt = require("jsonwebtoken");
const { jwt: cfg } = require("../config/env");
const { UnauthorizedError } = require("../errors/AppError");

const signAccessToken = ({ id, role }) =>
  jwt.sign({ role }, cfg.accessSecret, { subject: String(id), expiresIn: cfg.accessTtl });

const signRefreshToken = ({ id, tokenVersion }) =>
  jwt.sign({ tv: tokenVersion }, cfg.refreshSecret, {
    subject: String(id),
    expiresIn: cfg.refreshTtl,
  });

const verify = (token, secret, message) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new UnauthorizedError(message);
  }
};

const verifyAccessToken = (token) => {
  const payload = verify(token, cfg.accessSecret, "Invalid or expired token");
  return { id: payload.sub, role: payload.role };
};

const verifyRefreshToken = (token) => {
  const payload = verify(token, cfg.refreshSecret, "Invalid or expired session");
  return { id: payload.sub, tokenVersion: payload.tv };
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
