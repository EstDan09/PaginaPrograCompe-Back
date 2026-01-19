const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");

process.env.SECRET_KEY = 'testsecret';

describe("CFAccount API", () => {
    let adminToken;
    let studentToken;
    let coachToken;
    let testUsers = {};
    let testCFAccounts = {};

    const createAndLoginUser = async ({ username, password, role }) => {
        const user = await User.create({ username, password_hash: password, email: `${username}@test.com`, role });
        if (!role || role === 'student') {
            const cfAccount = await CFAccount.create({ student_id: user._id, cf_account: `${username}_cf`, is_verified_flag: true });
            testCFAccounts[username] = cfAccount;
        }
        const res = await request(app)
            .post("/auth/login")
            .send({ username, password });
        return { user, token: res.body.token };
    };

    beforeAll(async () => {
        process.env.SECRET_KEY = 'testsecret';
        await mongoose.connect(process.env.DB_URI);
        await mongoose.connection.dropDatabase();

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

    describe("GET /cfaccount/me", () => {
        it("student can get their own cf account", async () => {
            const res = await request(app)
                .get("/cfaccount/me")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.cf_account).toBe("student_cf");
            expect(res.body.student_id).toBe(testUsers.student._id.toString());
        });

        it("coach cannot get cf account", async () => {
            const res = await request(app)
                .get("/cfaccount/me")
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /cfaccount/get", () => {
        it("admin can get cf accounts with filters", async () => {
            const res = await request(app)
                .get("/cfaccount/get")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.cfAccounts)).toBe(true);
            expect(res.body.cfAccounts.length).toBeGreaterThanOrEqual(1);
        });

        it("student cannot get cf accounts", async () => {
            const res = await request(app)
                .get("/cfaccount/get")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /cfaccount/get/:id", () => {
        it("admin can get cf account by id", async () => {
            const cfAccountId = testCFAccounts.student._id;
            const res = await request(app)
                .get(`/cfaccount/get/${cfAccountId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.cf_account).toBe("student_cf");
        });

        it("student cannot get cf account by id", async () => {
            const cfAccountId = testCFAccounts.student._id;
            const res = await request(app)
                .get(`/cfaccount/get/${cfAccountId}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /cfaccount/start_verify", () => {
        it("student can start verify", async () => {
            const res = await request(app)
                .get("/cfaccount/start_verify")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("verification_token");
            expect(res.body).toHaveProperty("cf_code");
        });
    });

    describe("PUT /cfaccount/update/:id", () => {
        it("admin can update cf account", async () => {
            const cfAccountId = testCFAccounts.student._id;
            const res = await request(app)
                .put(`/cfaccount/update/${cfAccountId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_account: "newcf" });

            expect(res.statusCode).toBe(200);
            expect(res.body.cf_account).toBe("newcf");
        });

        it("student can update their own cf account", async () => {
            const cfAccountId = testCFAccounts.student._id;
            const res = await request(app)
                .put(`/cfaccount/update/${cfAccountId}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ cf_account: "updatedcf" });

            expect(res.statusCode).toBe(200);
            expect(res.body.cf_account).toBe("updatedcf");
        });
    });
});
