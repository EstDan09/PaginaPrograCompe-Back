const path = require("path");

// Always load environment variables
// For integration tests, NODE_ENV should NOT be "test" to use real API
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
require("dotenv").config({
  path: path.resolve(__dirname, envFile),
  override: true
});

// Ensure NODE_ENV is set correctly based on context
// If not explicitly set, default to test for regular test runs
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}