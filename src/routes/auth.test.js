const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

describe("Auth API", () => {
    let adminToken;

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);
        await User.deleteMany({});

        await User.create({
            username: "admin",
            password_hash: "adminpassword",
            email: "admin@test.com",
            role: "admin"
        });

        const res = await request(app)
            .post("/auth/login")
            .send({
                username: "admin",
                password: "adminpassword"
            });

        adminToken = res.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("POST /auth/register", () => {
        it("registers a new user and returns a token", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    username: "testuser",
                    password: "password123",
                    email: "test@test.com",
                    role: "student"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("token");

            const user = await User.findOne({ username: "testuser" });
            expect(user).not.toBeNull();
        });

        it("rejects duplicate usernames", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    username: "testuser",
                    password: "password123",
                    email: "test2@test.com"
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /auth/login", () => {
        it("logs in an existing user", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({
                    username: "testuser",
                    password: "password123"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
        });

        it("rejects invalid credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({
                    username: "testuser",
                    password: "wrongpassword"
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /auth/refresh-token", () => {
        it("refreshes token with valid auth header", async () => {
            const res = await request(app)
                .post("/auth/refresh-token")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
        });

        it("rejects missing token", async () => {
            const res = await request(app)
                .post("/auth/refresh-token");

            expect(res.statusCode).toBe(401);
        });
    });
});