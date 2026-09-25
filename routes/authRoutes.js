const express = require("express");
const env = require("../config/env");
const validate = require("../middleware/validate");
const requireAuth = require("../middleware/requireAuth");
const requireXhrHeader = require("../middleware/requireHeader");
const { createAuthLimiter } = require("../middleware/rateLimit");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validators/auth.schemas");
const {
  register,
  login,
  refresh,
  logout,
  me,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();
const limiter = createAuthLimiter({ max: env.authRateLimitMax });

router.post("/register", limiter, validate(registerSchema), register);
router.post("/login", limiter, validate(loginSchema), login);
router.post("/refresh", requireXhrHeader, refresh);
router.post("/logout", requireXhrHeader, logout);
router.get("/me", requireAuth, me);
router.patch("/me/password", requireAuth, validate(changePasswordSchema), changePassword);

module.exports = router;
