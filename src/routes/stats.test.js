const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const app = require("../app");

describe("Stats API", () => {
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

    describe("GET /stats/get-student-stats/:studentId", () => {
        it("should return 404 when student ID is invalid", async () => {
            const response = await request(app)
                .get("/stats/get-student-stats/invalid-id")
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(404);

            expect(response.body.message).toContain("Student not found");
        });

        it("should return 404 when student does not exist", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/stats/get-student-stats/${nonExistentId}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(404);

            expect(response.body.message).toContain("Student not found");
        });

        it("should return 400 when user is not a student", async () => {
            const response = await request(app)
                .get(`/stats/get-student-stats/${testUsers.coach._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(400);

            expect(response.body.message).toBe("User is not a student");
        });

        it("should return 400 when student does not have a Codeforces account linked", async () => {
            const studentWithoutCF = await User.create({
                username: "nocfstudent",
                password_hash: "password123",
                email: "nocfstudent@test.com",
                role: "student"
            });

            const response = await request(app)
                .get(`/stats/get-student-stats/${studentWithoutCF._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(400);

            expect(response.body.message).toContain("does not have a Codeforces account linked");
        });

        it("should return student stats successfully", async () => {
            const response = await request(app)
                .get(`/stats/get-student-stats/${testUsers.student._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("user");
            expect(response.body).toHaveProperty("kpis");
            expect(response.body).toHaveProperty("ratingGraph");
            expect(response.body).toHaveProperty("solvesByRating");
            expect(response.body).toHaveProperty("tags");
            expect(response.body).toHaveProperty("meta");

            expect(response.body.user.userId).toBe(testUsers.student._id.toString());
            expect(response.body.user.cfHandle).toBe("student_cf");
            expect(response.body.user.role).toBe("student");

            expect(response.body.kpis).toHaveProperty("rating");
            expect(response.body.kpis).toHaveProperty("solvedTotal");
            expect(response.body.kpis).toHaveProperty("streakDays");

            expect(response.body.meta.source).toBe("codeforces+db");
            expect(response.body.meta.cacheTtlSeconds).toBe(3600);
            expect(response.body.meta.generatedAt).toBeDefined();
        });

        it("should handle errors gracefully when CF account not found", async () => {
            const studentWithoutCF = await User.create({
                username: "noCFUser",
                password_hash: "password123",
                email: "nocf@test.com",
                role: "student"
            });

            const response = await request(app)
                .get(`/stats/get-student-stats/${studentWithoutCF._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(400);

            expect(response.body.message).toContain("Codeforces account");
        });

        it("should return proper metadata with current timestamp", async () => {
            const beforeRequest = new Date();
            const response = await request(app)
                .get(`/stats/get-student-stats/${testUsers.student._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .expect(200);
            const afterRequest = new Date();

            const generatedAt = new Date(response.body.meta.generatedAt);
            expect(generatedAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
            expect(generatedAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
        });
    });
});
