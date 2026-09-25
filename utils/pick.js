// Copies only the listed keys that are actually present. Used to whitelist
// request-body fields so a client can never write userId, _id, timestamps or
// any other field we didn't intend to expose.
const pick = (source, keys) => {
  const out = {};
  for (const key of keys) {
    if (source && source[key] !== undefined) out[key] = source[key];
  }
  return out;
};

module.exports = pick;
