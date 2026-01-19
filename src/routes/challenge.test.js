const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const Challenge = require("../models/Challenge");
const Exercise = require("../models/Exercise");
const Assignment = require("../models/Assignment");
const Group = require("../models/Group");
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
        
        // Create CFAccount for students so they have cf_handle in JWT
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

        // Create a group
        const groupRes = await request(app)
            .post("/group/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ name: "Test Group", description: "Group for testing" });
        const testGroup = groupRes.body;

        // Create an assignment
        const assignmentRes = await request(app)
            .post("/assignment/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ title: "Test Assignment", description: "Assignment for testing", dueDate: new Date(), parent_group: testGroup._id });
        const testAssignment = assignmentRes.body;

        // Create exercises
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

        // Add student to group
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

            expect(res.statusCode).toBe(500); // MongoDB duplicate key error
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
            // Create challenges to delete
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
            // Create challenges to verify
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
});
