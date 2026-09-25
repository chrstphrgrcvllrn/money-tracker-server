const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const requireAuth = require("./middleware/requireAuth");
const validateObjectId = require("./middleware/validateObjectId");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const loanRoutes = require("./routes/loanRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const billRoutes = require("./routes/billRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const thoughtRoutes = require("./routes/thoughtRoutes");
const watchRoutes = require("./routes/watchlistRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const houseExpenseRoutes = require("./routes/houseExpenseRoutes");
const notebookRoutes = require("./routes/notebookRoutes");
const trackerRoutes = require("./routes/trackerRoutes");
const waterRoutes = require("./routes/waterRoutes");

// Every user-data router is mounted behind requireAuth HERE, once, rather than
// inside each router file, so a new data route can't be left public by accident.
const DATA_ROUTES = [
  ["/api/notes", noteRoutes],
  ["/api/loans", loanRoutes],
  ["/api/salary", salaryRoutes],
  ["/api/bills", billRoutes],
  ["/api/savings", savingsRoutes],
  ["/api/expenses", expenseRoutes],
  ["/api/calendar-events", calendarRoutes],
  ["/api/thoughts", thoughtRoutes],
  ["/api/watchlist", watchRoutes],
  ["/api/subscription", subscriptionRoutes],
  ["/api/house-expenses", houseExpenseRoutes],
  ["/api/notebook", notebookRoutes],
  ["/api/tracker", trackerRoutes],
  ["/api/water", waterRoutes],
];

// Routers are module singletons; register their param handlers only once even
// if createApp() runs several times (tests).
const configuredRouters = new WeakSet();

const createApp = () => {
  const app = express();

  // Behind Railway's proxy: needed for the real client IP (rate limiting)
  // and for secure cookies.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // No Origin header = not a browser (curl, server-to-server).
        if (!origin) return callback(null, true);
        callback(null, env.clientOrigins.includes(origin));
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);

  DATA_ROUTES.forEach(([path, router]) => {
    if (!configuredRouters.has(router)) {
      router.param("id", validateObjectId);
      router.param("expenseId", validateObjectId);
      configuredRouters.add(router);
    }
    app.use(path, requireAuth, router);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
