const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
    it("returns ok", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
    });
});