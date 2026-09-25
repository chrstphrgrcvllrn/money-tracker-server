const mongoose = require("mongoose");

const toObjectId = (userId) => {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    // A programming error, not a user error: every call must be scoped.
    throw new Error("userId is required for owned-model queries");
  }
  return new mongoose.Types.ObjectId(String(userId));
};

// Adds a required `userId` owner to a schema, plus scoped query helpers.
// Controllers use ONLY these helpers, so a query can't forget the owner:
// every one of them takes userId as its first argument and throws without it.
// A record that doesn't exist and one owned by someone else both come back as
// null, so callers answer 404 for both and ids can't be probed.
module.exports = function userOwned(schema) {
  schema.add({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  });

  schema.statics.findOwned = function (userId, filter = {}) {
    return this.find({ ...filter, userId: toObjectId(userId) });
  };

  schema.statics.findOneOwned = function (userId, id) {
    return this.findOne({ _id: id, userId: toObjectId(userId) });
  };

  schema.statics.createOwned = function (userId, data) {
    // userId is applied last so a body can never choose its own owner.
    return this.create({ ...data, userId: toObjectId(userId) });
  };

  schema.statics.updateOwned = function (userId, id, update, options = {}) {
    return this.findOneAndUpdate({ _id: id, userId: toObjectId(userId) }, update, {
      returnDocument: "after",
      runValidators: true,
      ...options,
    });
  };

  schema.statics.deleteOwned = function (userId, id) {
    return this.findOneAndDelete({ _id: id, userId: toObjectId(userId) });
  };

  schema.statics.toOwnerId = toObjectId;
};
