import { MongoClient } from "mongodb";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // load .env

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function resetExpenses() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("expenses");

    // 1️⃣ Backup existing data to old.json
    const oldData = await collection.find({}).toArray();
    fs.writeFileSync("old.json", JSON.stringify(oldData, null, 2));
    console.log("✅ Existing expenses backed up to old.json");

    // 2️⃣ Delete all current entries
    await collection.deleteMany({});
    console.log("🗑️ All existing expenses deleted");

    // 3️⃣ Read your expenses_backup.json
    const newData = JSON.parse(fs.readFileSync("expenses_backup.json"));
    
    // 4️⃣ Insert backup data
    await collection.insertMany(newData);
    console.log("✅ expenses_backup.json inserted successfully");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

resetExpenses();