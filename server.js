require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const noteRoutes = require("./routes/noteRoutes");
const loanRoutes = require("./routes/loanRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const billRoutes = require("./routes/billRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes.js");



const app = express();


// CORS setup
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.PROD_FRONTEND_URL] // actual site
  : [process.env.DEV_FRONTEND_URL]; // local/dev

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));


app.use(express.json());


connectDB();

app.use("/api/notes", noteRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/exercise", exerciseRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});