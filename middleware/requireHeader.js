const { AppError } = require("../errors/AppError");

// Cookie-only endpoints (refresh / logout) must be called with a custom
// header. Browsers force a CORS preflight for it, so a page on another
// origin can't trigger them with the user's cookie (CSRF defence, needed
// because the refresh cookie may be SameSite=None across domains).
const requireXhrHeader = (req, _res, next) => {
  if (req.get("x-requested-with") !== "XMLHttpRequest") {
    return next(new AppError("Missing required header", 400, "BAD_REQUEST"));
  }
  next();
};

module.exports = requireXhrHeader;
