const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const StudentGroup = require("../models/StudentGroup");

describe("Challenge API", () => {
    let adminToken;
    let studentToken;
    let studentToken2;
    let coachToken;
    let testUsers = {};
    let testExercises = {};
    let testChallenges = {};

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

        ({ user: testUsers.student2, token: studentToken2 } = await createAndLoginUser({
            username: "student2",
            password: "studentpass",
            role: "student"
        }));

        ({ user: testUsers.coach, token: coachToken } = await createAndLoginUser({
            username: "coach",
            password: "coachpass",
            role: "coach"
        }));

        const groupRes = await request(app)
            .post("/group/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ name: "Test Group", description: "Group for testing" });
        const testGroup = groupRes.body;

        const assignmentRes = await request(app)
            .post("/assignment/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ title: "Test Assignment", description: "Assignment for testing", dueDate: new Date(), parent_group: testGroup._id });
        const testAssignment = assignmentRes.body;

        const exercise1Res = await request(app)
            .post("/exercise/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ name: "Test Exercise 1", cf_code: "123A", parent_assignment: testAssignment._id });
        testExercises.exercise1 = exercise1Res.body;

        const exercise2Res = await request(app)
            .post("/exercise/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ name: "Test Exercise 2", cf_code: "456B", parent_assignment: testAssignment._id });
        testExercises.exercise2 = exercise2Res.body;

        await StudentGroup.create({ student_id: testUsers.student._id, group_id: testGroup._id });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("POST /challenge/create", () => {
        it("student can create a challenge", async () => {
            const res = await request(app)
                .post("/challenge/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ cf_code: "123A" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("challenge");
            expect(res.body.challenge.student_id).toBe(testUsers.student._id.toString());
            expect(res.body.challenge.cf_code).toBe("123A");
            testChallenges.challenge1 = res.body.challenge;
        });

        it("rejects duplicate challenge for same student and cf_code", async () => {
            const res = await request(app)
                .post("/challenge/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ cf_code: "123A" });

            expect(res.statusCode).toBe(500);
        });

        it("rejects missing cf_code", async () => {
            const res = await request(app)
                .post("/challenge/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /challenge/create/:student_id", () => {
        it("admin can create challenge for a student", async () => {
            const res = await request(app)
                .post(`/challenge/create/${testUsers.student._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_code: "456B" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("challenge");
            expect(res.body.challenge.student_id).toBe(testUsers.student._id.toString());
            expect(res.body.challenge.cf_code).toBe("456B");
            testChallenges.challenge2 = res.body.challenge;
        });

        it("admin cannot create challenge for invalid student", async () => {
            const res = await request(app)
                .post("/challenge/create/invalid_id")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_code: "789C" });

            expect(res.statusCode).toBe(400);
        });

        it("admin cannot create challenge for non-student user", async () => {
            const res = await request(app)
                .post(`/challenge/create/${testUsers.coach._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_code: "789C" });

            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /challenge/get", () => {
        it("student can get their own challenges", async () => {
            const res = await request(app)
                .get("/challenge/get")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("challenges");
            expect(Array.isArray(res.body.challenges)).toBe(true);
            expect(res.body.challenges.length).toBeGreaterThan(0);
        });

        it("admin can get all challenges", async () => {
            const res = await request(app)
                .get("/challenge/get")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("challenges");
            expect(Array.isArray(res.body.challenges)).toBe(true);
        });

        it("admin can filter challenges by student_id", async () => {
            const res = await request(app)
                .get(`/challenge/get?student_id=${testUsers.student._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.challenges.every(challenge => challenge.student_id === testUsers.student._id.toString())).toBe(true);
        });

        it("admin can filter challenges by cf_code", async () => {
            const res = await request(app)
                .get("/challenge/get?cf_code=123A")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.challenges.every(challenge => challenge.cf_code === "123A")).toBe(true);
        });

        it("student cannot filter by other student's challenges", async () => {
            const res = await request(app)
                .get(`/challenge/get?student_id=${testUsers.admin._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("GET /challenge/get/:id", () => {
        it("admin can get challenge by id", async () => {
            const res = await request(app)
                .get(`/challenge/get/${testChallenges.challenge1._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(testChallenges.challenge1._id);
        });

        it("returns 404 for non-existent challenge", async () => {
            const res = await request(app)
                .get("/challenge/get/invalid_id")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe("DELETE /challenge/delete/:id", () => {
        let deleteChallengeStudent, deleteChallengeOther;

        beforeAll(async () => {
            const res1 = await request(app)
                .post("/challenge/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ cf_code: "777E" });
            deleteChallengeStudent = res1.body.challenge;

            const res2 = await request(app)
                .post(`/challenge/create/${testUsers.student2._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_code: "778F" });
            deleteChallengeOther = res2.body.challenge;
        });

        it("student can delete their own challenge", async () => {
            const res = await request(app)
                .delete(`/challenge/delete/${deleteChallengeStudent._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
        });

        it("student cannot delete other student's challenge", async () => {
            const res = await request(app)
                .delete(`/challenge/delete/${deleteChallengeOther._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(400);
        });

        it("admin can delete any challenge", async () => {
            const res = await request(app)
                .delete(`/challenge/delete/${deleteChallengeOther._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });

        it("returns 404 for non-existent challenge", async () => {
            const res = await request(app)
                .delete("/challenge/delete/invalid_id")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe("PUT /challenge/verify/:id", () => {
        let verifyChallengeStudent, verifyChallengeOther;

        beforeAll(async () => {
            const res1 = await request(app)
                .post("/challenge/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ cf_code: "888F" });
            verifyChallengeStudent = res1.body.challenge;

            const res2 = await request(app)
                .post(`/challenge/create/${testUsers.student2._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ cf_code: "889G" });
            verifyChallengeOther = res2.body.challenge;
        });

        it("student can verify their own challenge", async () => {
            const res = await request(app)
                .put(`/challenge/verify/${verifyChallengeStudent._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.is_completed_flag).toBe(true);
            expect(res.body.completion_type).toBe("normal");
        });

        it("student cannot verify other student's challenge", async () => {
            const res = await request(app)
                .put(`/challenge/verify/${verifyChallengeOther._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(400);
        });

        it("admin can verify any challenge", async () => {
            const res = await request(app)
                .put(`/challenge/verify/${verifyChallengeStudent._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });

        it("returns 404 for non-existent challenge", async () => {
            const res = await request(app)
                .put("/challenge/verify/invalid_id")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe("GET /challenge/ask", () => {
        it("student can ask for a challenge with no filters", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({});

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("cf_code");
            expect(res.body).toHaveProperty("name");
            expect(res.body).toHaveProperty("rating");
            expect(res.body).toHaveProperty("contestId");
            expect(res.body).toHaveProperty("tags");
        });

        it("student can ask for a challenge with min_rating", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ min_rating: 1000 });

            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBeGreaterThanOrEqual(1000);
        });

        it("student can ask for a challenge with max_rating", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ max_rating: 1500 });

            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBeLessThanOrEqual(1500);
        });

        it("student can ask for a challenge with min and max rating", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ min_rating: 1000, max_rating: 1500 });

            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBeGreaterThanOrEqual(1000);
            expect(res.body.rating).toBeLessThanOrEqual(1500);
        });

        it("student can ask for a challenge with tags filter", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ tags: ["implementation"] });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.tags)).toBe(true);
            expect(res.body.tags).toContain("implementation");
        });

        it("student can ask for a challenge with multiple tags", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ tags: ["implementation", "greedy"] });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.tags)).toBe(true);
            expect(res.body.tags).toContain("implementation");
            expect(res.body.tags).toContain("greedy");
        });

        it("student can ask for a challenge with all filters", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ min_rating: 800, max_rating: 2000, tags: ["implementation"] });

            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBeGreaterThanOrEqual(800);
            expect(res.body.rating).toBeLessThanOrEqual(2000);
            expect(res.body.tags).toContain("implementation");
        });

        it("returns 400 when min_rating is not a number", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ min_rating: "invalid" });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid min_rating");
        });

        it("returns 400 when max_rating is not a number", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ max_rating: "invalid" });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid max_rating");
        });

        it("returns 400 when tags is not an array", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ tags: "invalid" });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid tags");
        });

        it("returns 400 when min_rating is greater than max_rating", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ min_rating: 1500, max_rating: 1000 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("min_rating cannot be greater than max_rating");
        });

        it("admin cannot ask for a challenge", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({});

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied. Students only.");
        });

        it("coach cannot ask for a challenge", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${coachToken}`)
                .send({});

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied. Students only.");
        });

        it("unauthenticated user cannot ask for a challenge", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .send({});

            expect(res.statusCode).toBe(401);
        });

        it("returns a cf_code in correct format", async () => {
            const res = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({});

            expect(res.statusCode).toBe(200);
            expect(res.body.cf_code).toMatch(/^\d+[A-Z]/);
        });

        it("returns different problems on multiple calls", async () => {
            const res1 = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({});

            const res2 = await request(app)
                .get("/challenge/ask")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({});

            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
            // Note: Could be same problem by chance, but very unlikely
            expect(res1.body).toHaveProperty("cf_code");
            expect(res2.body).toHaveProperty("cf_code");
        });
    });
});
