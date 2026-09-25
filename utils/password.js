// The only file that imports the bcrypt library. (bcryptjs is the pure-JS
// implementation: same hashes, but nothing to compile on the host.)
const bcrypt = require("bcryptjs");
const { bcryptCost } = require("../config/env");

const hashPassword = (plain) => bcrypt.hash(plain, bcryptCost);

const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Hash of a random string, used to burn the same time as a real comparison
// when the username doesn't exist (keeps login timing uniform).
let dummyHash;
const verifyAgainstDummy = async (plain) => {
  dummyHash = dummyHash || (await bcrypt.hash("dummy-password-for-timing", bcryptCost));
  await bcrypt.compare(plain, dummyHash);
};

module.exports = { hashPassword, verifyPassword, verifyAgainstDummy };
