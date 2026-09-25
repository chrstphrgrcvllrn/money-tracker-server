// Runs before any module is loaded, so config/env.js sees these values.
// Nothing here is a real secret; the database is an in-memory server.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://in-memory-placeholder";
process.env.JWT_ACCESS_SECRET = "test-access-secret-0123456789abcdef0123456789";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-0123456789abcdef012345678";
process.env.BCRYPT_COST = "4"; // fast hashing in tests only
process.env.AUTH_RATE_LIMIT_MAX = "1000"; // rate limiting is tested separately
process.env.CLIENT_ORIGIN = "http://localhost:5174";
