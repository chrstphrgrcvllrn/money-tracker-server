require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const noteRoutes = require("./routes/noteRoutes");
const loanRoutes = require("./routes/loanRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const billRoutes = require("./routes/billRoutes");

const app = express();

app.use(cors());
app.use(express.json());


connectDB();

app.use("/api/notes", noteRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/bills", billRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});