const User = require("../models/User");
const env = require("../config/env");
const { hashPassword, verifyPassword, verifyAgainstDummy } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { toPublicUser } = require("../utils/publicUser");
const {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} = require("../errors/AppError");

const REFRESH_COOKIE = "refreshToken";

// Set and clear must use the same options or the browser keeps the cookie.
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.refreshCookie.secure,
  sameSite: env.refreshCookie.sameSite,
  path: "/api/auth",
});

const setRefreshCookie = (res, user) => {
  res.cookie(
    REFRESH_COOKIE,
    signRefreshToken({ id: user._id, tokenVersion: user.tokenVersion }),
    { ...cookieOptions(), maxAge: env.jwt.refreshTtlMs }
  );
};

const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, cookieOptions());

// Access token + user go in the body; the refresh token only ever travels in
// the httpOnly cookie.
const sendSession = (res, user, status = 200) => {
  setRefreshCookie(res, user);
  res.status(status).json({
    accessToken: signAccessToken({ id: user._id, role: user.role }),
    user: toPublicUser(user),
  });
};

const register = async (req, res) => {
  const { username, password } = req.body;

  if (await User.exists({ username })) {
    throw new ConflictError("Username is already taken", "USERNAME_TAKEN");
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await User.create({ username, passwordHash });
  } catch (error) {
    // Two simultaneous registrations for the same name: the unique index wins.
    if (error.code === 11000) {
      throw new ConflictError("Username is already taken", "USERNAME_TAKEN");
    }
    throw error;
  }

  sendSession(res, user, 201);
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+passwordHash");

  let valid = false;
  if (user) {
    valid = await verifyPassword(password, user.passwordHash);
  } else {
    await verifyAgainstDummy(password); // same cost as a real check
  }

  // One message for "no such user" and "wrong password".
  if (!valid) {
    throw new UnauthorizedError("Invalid username or password", "INVALID_CREDENTIALS");
  }

  sendSession(res, user);
};

const refresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new UnauthorizedError("Not authenticated");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }

  const user = await User.findById(payload.id);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    clearRefreshCookie(res);
    throw new UnauthorizedError("Session expired");
  }

  sendSession(res, user); // rotates the cookie
};

const logout = (_req, res) => {
  clearRefreshCookie(res);
  res.status(204).end();
};

const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new UnauthorizedError("Account no longer exists");
  res.json({ user: toPublicUser(user) });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!user) throw new UnauthorizedError("Account no longer exists");

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    // 400 (not 401) so the client doesn't mistake it for an expired session.
    throw new ValidationError({ currentPassword: "Current password is incorrect" });
  }
  if (currentPassword === newPassword) {
    throw new ValidationError({ newPassword: "New password must be different" });
  }

  user.passwordHash = await hashPassword(newPassword);
  user.tokenVersion += 1; // every other session's refresh token is now dead
  await user.save();

  // This session continues with a fresh cookie carrying the new version.
  sendSession(res, user);
};

module.exports = { register, login, refresh, logout, me, changePassword };
