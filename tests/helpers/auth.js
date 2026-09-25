const request = require("supertest");

const XHR = { "X-Requested-With": "XMLHttpRequest" };

// Registers a user and returns what a logged-in browser would hold.
const registerUser = async (app, username, password = "password123") => {
  const res = await request(app).post("/api/auth/register").send({ username, password });
  if (res.status !== 201) {
    throw new Error(`register failed for ${username}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return {
    username,
    password,
    token: res.body.accessToken,
    user: res.body.user,
    cookies: res.headers["set-cookie"],
  };
};

const authed = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { registerUser, authed, XHR };
