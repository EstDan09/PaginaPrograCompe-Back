const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");

describe("User API", () => {
    let adminToken;
    let studentToken;
    let coachToken;
    let testUsers = {};

    const createAndLoginUser = async ({ username, password, role }) => {
        const user = await User.create({ username, password_hash: password, email: `${username}@test.com`, role });
        if (!role || role === 'student') {
            await CFAccount.create({ student_id: user._id, cf_account: `${username}_cf`, is_verified_flag: true });
        }
        const res = await request(app)
            .post("/auth/login")
            .send({ username, password });
        return { user, token: res.body.token };
    };

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);

        ({ user: testUsers.admin, token: adminToken } = await createAndLoginUser({
            username: "admin",
            password: "adminpass",
            role: "admin"
        }));

        ({ user: testUsers.student, token: studentToken } = await createAndLoginUser({
            username: "student",
            password: "studentpass",
            role: "student"
        }));

        ({ user: testUsers.coach, token: coachToken } = await createAndLoginUser({
            username: "coach",
            password: "coachpass",
            role: "coach"
        }));
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("Admin operations", () => {
        it("admin can create a new user", async () => {
            const res = await request(app)
                .post("/admin/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ username: "newuser", password: "pass123", email: "newuser@test.com", role: "student", cf_account: "fisher199" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.username).toBe("newuser");
        });

        it("non-admin cannot create a new user", async () => {
            const res = await request(app)
                .post("/admin/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ username: "failuser", password: "pass123", role: "student" });

            expect(res.statusCode).toBe(403);
        });

        it("admin can get users with filters", async () => {
            const res = await request(app)
                .get("/admin/get")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3);
        });

        it("admin can update a user", async () => {
            const userId = testUsers.student._id;
            const res = await request(app)
                .put(`/admin/update/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ email: "newemail@student.com" });

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe("newemail@student.com");
        });

        it("admin can delete a user", async () => {
            const user = await User.create({ username: "todelete", password_hash: "pass", email: "del@test.com", role: "student" });
            const CFAccount = require('../models/CFAccount');
            await CFAccount.create({ student_id: user._id, cf_account: 'fisher199' });
            const res = await request(app)
                .delete(`/admin/delete/${user._id}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            const deleted = await User.findById(user._id);
            expect(deleted).toBeNull();
        });
    });

    describe("Normal user operations (safe endpoints)", () => {
        it("student can get list of users (excluding admins)", async () => {
            const res = await request(app)
                .get("/user/get")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.some(u => u.role === "admin")).toBe(false);
        });

        it("student can get own profile", async () => {
            const res = await request(app)
                .get("/user/me")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe("student");
        });

        it("student can update own profile", async () => {
            const res = await request(app)
                .put("/user/update")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ email: "updated@student.com" });

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe("updated@student.com");
        });

        it("student can delete own account", async () => {
            const { user, token } = await createAndLoginUser({ username: "tobedeleted", password: "pass", role: "student" });

            const res = await request(app)
                .delete("/user/delete")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const deleted = await User.findById(user._id);
            expect(deleted).toBeNull();
        });

        it("student cannot access admin-only safe endpoints", async () => {
            const res = await request(app)
                .get(`/admin/get/${testUsers.coach._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("Get by username", () => {
        it("student can safely get another non-admin user by username", async () => {
            const res = await request(app)
                .get(`/user/get-by-username/${testUsers.coach.username}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(testUsers.coach.username);
        });

        it("student cannot view admin details", async () => {
            const res = await request(app)
                .get(`/user/get-by-username/${testUsers.admin.username}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});