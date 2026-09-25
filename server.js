const env = require("./config/env");
const connectDB = require("./config/db");
const createApp = require("./app");
const { runBootMigration } = require("./scripts/run-boot-migration");

// Optional one-time migration (off unless MIGRATE_ON_BOOT is set).
connectDB().then(() => runBootMigration(env.migration));

createApp().listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
