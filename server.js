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


const app = express();


// CORS setup
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.PROD_FRONTEND_URL] // actual site
  : [process.env.DEV_FRONTEND_URL]; // local/dev

app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
  // if you use cookies or auth headers
}));


app.use(express.json());


connectDB();

app.use("/api/notes", noteRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/expenses", expenseRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});