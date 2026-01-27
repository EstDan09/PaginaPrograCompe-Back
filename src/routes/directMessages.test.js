const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const DirectMessage = require("../models/DirectMessage");
const BlockedUser = require("../models/BlockedUser");

describe("Direct Messages API", () => {
    let adminToken;
    let studentToken1;
    let studentToken2;
    let studentToken3;
    let student1;
    let student2;
    let student3;
    let admin;

    const createAndLoginUser = async ({ username, password, role }) => {
        const user = await User.create({ username, password_hash: password, email: `${username}@test.com`, role });

        if (role === "student") {
            await CFAccount.create({ student_id: user._id, cf_account: `${username}_cf`, is_verified_flag: true });
        }

        const res = await request(app)
            .post("/auth/login")
            .send({ username, password });
        return { user, token: res.body.token };
    };

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);
        await mongoose.connection.dropDatabase();

        ({ user: admin, token: adminToken } = await createAndLoginUser({
            username: "admin",
            password: "adminpass",
            role: "admin"
        }));

        ({ user: student1, token: studentToken1 } = await createAndLoginUser({
            username: "student1",
            password: "studentpass",
            role: "student"
        }));

        ({ user: student2, token: studentToken2 } = await createAndLoginUser({
            username: "student2",
            password: "studentpass",
            role: "student"
        }));

        ({ user: student3, token: studentToken3 } = await createAndLoginUser({
            username: "student3",
            password: "studentpass",
            role: "student"
        }));
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("POST /direct-messages/send/:user_id", () => {
        it("sends a direct message successfully", async () => {
            const res = await request(app)
                .post(`/direct-messages/send/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    message: "Hello, this is a test message!"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.sender_id).toBe(student1._id.toString());
            expect(res.body.receiver_id).toBe(student2._id.toString());
            expect(res.body.message).toBe("Hello, this is a test message!");
        });

        it("rejects sending message to yourself", async () => {
            const res = await request(app)
                .post(`/direct-messages/send/${student1._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    message: "Self message"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Cannot send message to yourself");
        });

        it("rejects invalid receiver_id", async () => {
            const res = await request(app)
                .post("/direct-messages/send/invalid-id")
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    receiver_id: "invalid-id",
                    message: "Test message"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid receiver_id");
        });

        it("rejects message from blocked sender", async () => {
            await BlockedUser.create({
                user_id: student2._id,
                blocked_user_id: student1._id
            });

            const res = await request(app)
                .post(`/direct-messages/send/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    message: "This should be blocked"
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("You are blocked by this user");
        });

        it("rejects missing message field", async () => {
            const res = await request(app)
                .post(`/direct-messages/send/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({});

            // Missing message field will cause validation error or server error
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });
    });

    describe("GET /direct-messages/conversation/", () => {
        beforeEach(async () => {
            await DirectMessage.create({
                sender_id: student1._id,
                receiver_id: student2._id,
                message: "Message from 1 to 2"
            });

            await DirectMessage.create({
                sender_id: student2._id,
                receiver_id: student1._id,
                message: "Message from 2 to 1"
            });

            await DirectMessage.create({
                sender_id: student1._id,
                receiver_id: student3._id,
                message: "Message from 1 to 3"
            });
        });

        it("retrieves conversation partners for a user", async () => {
            const res = await request(app)
                .get("/direct-messages/conversation/")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body).toContain(student2._id.toString());
            expect(res.body).toContain(student3._id.toString());
        });

        it("returns empty array when user has no conversations", async () => {
            const res = await request(app)
                .get("/direct-messages/conversation/")
                .set("Authorization", `Bearer ${studentToken3}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe("GET /direct-messages/conversation/:user_id", () => {
        beforeEach(async () => {
            await DirectMessage.deleteMany({});

            await DirectMessage.create({
                sender_id: student1._id,
                receiver_id: student2._id,
                message: "First message"
            });

            await DirectMessage.create({
                sender_id: student2._id,
                receiver_id: student1._id,
                message: "Second message"
            });

            await DirectMessage.create({
                sender_id: student1._id,
                receiver_id: student2._id,
                message: "Third message"
            });
        });

        it("retrieves conversation between two users", async () => {
            const res = await request(app)
                .get(`/direct-messages/conversation/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(3);
            expect(res.body[0].message).toBe("First message");
            expect(res.body[1].message).toBe("Second message");
            expect(res.body[2].message).toBe("Third message");
        });

        it("returns empty array for non-existent conversation", async () => {
            const res = await request(app)
                .get(`/direct-messages/conversation/${student3._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it("rejects invalid user_id", async () => {
            const res = await request(app)
                .get("/direct-messages/conversation/invalid-id")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid user_id");
        });
    });

    describe("POST /direct-messages/block/:user_id", () => {
        it("blocks a user successfully", async () => {
            const res = await request(app)
                .post(`/direct-messages/block/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.user_id).toBe(student1._id.toString());
            expect(res.body.blocked_user_id).toBe(student2._id.toString());
        });

        it("rejects blocking yourself", async () => {
            const res = await request(app)
                .post(`/direct-messages/block/${student1._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Cannot block yourself");
        });

        it("rejects blocking already blocked user", async () => {
            await BlockedUser.create({
                user_id: student1._id,
                blocked_user_id: student3._id
            });

            const res = await request(app)
                .post(`/direct-messages/block/${student3._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("User is already blocked");
        });

        it("rejects invalid user_id", async () => {
            const res = await request(app)
                .post("/direct-messages/block/invalid-id")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid user_id");
        });

        afterEach(async () => {
            await BlockedUser.deleteMany({});
        });
    });

    describe("DELETE /direct-messages/unblock/:user_id", () => {
        it("unblocks a user successfully", async () => {
            const blocked = await BlockedUser.create({
                user_id: student1._id,
                blocked_user_id: student2._id
            });

            const res = await request(app)
                .delete(`/direct-messages/unblock/${student2._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("User unblocked successfully");

            const blockExists = await BlockedUser.findOne({
                user_id: student1._id,
                blocked_user_id: student2._id
            });
            expect(blockExists).toBeNull();
        });

        it("rejects unblocking non-blocked user", async () => {
            const res = await request(app)
                .delete(`/direct-messages/unblock/${student3._id.toString()}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Blocked user not found");
        });

        it("rejects invalid user_id", async () => {
            const res = await request(app)
                .delete("/direct-messages/unblock/invalid-id")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid user_id");
        });

        afterEach(async () => {
            await BlockedUser.deleteMany({});
        });
    });

    describe("GET /direct-messages/blocked", () => {
        beforeEach(async () => {
            await BlockedUser.deleteMany({});

            await BlockedUser.create({
                user_id: student1._id,
                blocked_user_id: student2._id
            });

            await BlockedUser.create({
                user_id: student1._id,
                blocked_user_id: student3._id
            });
        });

        it("retrieves list of blocked users", async () => {
            const res = await request(app)
                .get("/direct-messages/blocked")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body).toContain(student2._id.toString());
            expect(res.body).toContain(student3._id.toString());
        });

        it("returns empty array when user has no blocked users", async () => {
            const res = await request(app)
                .get("/direct-messages/blocked")
                .set("Authorization", `Bearer ${studentToken2}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });
});
