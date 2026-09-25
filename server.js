const env = require("./config/env");
const connectDB = require("./config/db");
const createApp = require("./app");

connectDB();

createApp().listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
