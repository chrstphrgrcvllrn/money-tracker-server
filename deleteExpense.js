// deleteExpense.js
require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense"); // make sure path is correct

const MONGO_URI = process.env.MONGO_URI;
const DELETE_ID = "69c929138b8941cca223a8a0";

async function deleteExpense() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // Wrap the ID in ObjectId — this is required to match the document
    const objectId = new mongoose.Types.ObjectId(DELETE_ID);

    const result = await Expense.findByIdAndDelete(objectId);

    if (result) {
      console.log(`Deleted: ${result.text}`);
    } else {
      console.log("Expense not found!");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
}

deleteExpense();