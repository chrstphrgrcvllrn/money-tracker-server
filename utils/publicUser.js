// The only shape of a user that is ever sent to a client.
const toPublicUser = (user) => ({
  id: String(user._id),
  username: user.username,
  role: user.role,
  createdAt: user.createdAt,
});

module.exports = { toPublicUser };
