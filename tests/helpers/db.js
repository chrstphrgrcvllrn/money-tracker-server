const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let server;

const connect = async () => {
  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri(), { dbName: "test" });
  // Build indexes (unique username, unique userId+date, ...) before tests run.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
};

const clear = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
  );
};

const disconnect = async () => {
  await mongoose.disconnect();
  if (server) await server.stop();
};

module.exports = { connect, clear, disconnect };
