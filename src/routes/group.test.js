const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const Group = require("../models/Group");
const StudentGroup = require("../models/StudentGroup");

describe("Group API", () => {
    let adminToken;
    let studentToken;
    let coachToken;
    let coachToken2;
    let testUsers = {};
    let testGroups = {};

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

        ({ user: testUsers.coach2, token: coachToken2 } = await createAndLoginUser({
            username: "coach2",
            password: "coachpass",
            role: "coach"
        }));

        const coachGroupRes = await request(app)
            .post("/group/create")
            .set("Authorization", `Bearer ${coachToken}`)
            .send({ name: "Coach's Group", description: "A group created by coach" });
        testGroups.coachGroup = coachGroupRes.body;

        const adminGroupRes = await request(app)
            .post("/group/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Admin's Group", description: "A group created by admin", parent_coach: testUsers.coach2._id });
        testGroups.adminGroup = adminGroupRes.body;
         
        await StudentGroup.create({ student_id: testUsers.student._id, group_id: testGroups.coachGroup._id });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("Create group", () => {
        it("coach can create a new group", async () => {
            const res = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ name: "New Coach Group", description: "Description" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.name).toBe("New Coach Group");
            expect(res.body.parent_coach).toBe(testUsers.coach._id.toString());
        });

        it("admin can create a new group with parent_coach", async () => {
            const res = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "New Admin Group", description: "Description", parent_coach: testUsers.coach._id });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.name).toBe("New Admin Group");
            expect(res.body.parent_coach).toBe(testUsers.coach._id.toString());
        });

        it("admin cannot create group without parent_coach", async () => {
            const res = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Fail Group", description: "Description" });

            expect(res.statusCode).toBe(400);
        });

        it("student cannot create a group", async () => {
            const res = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ name: "Student Group", description: "Description" });

            expect(res.statusCode).toBe(403);
        });

        it("unauthenticated user cannot create group", async () => {
            const res = await request(app)
                .post("/group/create")
                .send({ name: "Unauth Group", description: "Description" });

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Get groups", () => {
        it("coach can get their own groups", async () => {
            const res = await request(app)
                .get("/group/get")
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body.some(g => g._id === testGroups.coachGroup._id)).toBe(true);
        });

        it("admin can get all groups", async () => {
            const res = await request(app)
                .get("/group/get")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it("student cannot get groups", async () => {
            const res = await request(app)
                .get("/group/get")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("Get group by id", () => {
        it("coach can get their own group by id", async () => {
            const res = await request(app)
                .get(`/group/get/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(testGroups.coachGroup._id);
        });

        it("coach cannot get another coach's group", async () => {
            const res = await request(app)
                .get(`/group/get/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("student can get group they belong to", async () => {
            const res = await request(app)
                .get(`/group/get/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(testGroups.coachGroup._id);
        });

        it("student cannot get group they don't belong to", async () => {
            const res = await request(app)
                .get(`/group/get/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("admin can get any group by id", async () => {
            const res = await request(app)
                .get(`/group/get/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(testGroups.coachGroup._id);
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/group/get/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe("Update group", () => {
        it("coach can update their own group", async () => {
            const res = await request(app)
                .put(`/group/update/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ name: "Updated Coach Group", description: "Updated description" });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("Updated Coach Group");
            expect(res.body.description).toBe("Updated description");
        });

        it("coach cannot update another coach's group", async () => {
            const res = await request(app)
                .put(`/group/update/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ name: "Unauthorized Update" });

            expect(res.statusCode).toBe(403);
        });

        it("admin can update any group", async () => {
            const res = await request(app)
                .put(`/group/update/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Admin Updated Group" });

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe("Admin Updated Group");
        });

        it("student cannot update group", async () => {
            const res = await request(app)
                .put(`/group/update/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ name: "Student Update" });

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/group/update/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Update" });

            expect(res.statusCode).toBe(404);
        });
    });

    describe("Delete group", () => {
        it("coach can delete their own group", async () => {
            const groupToDelete = await Group.create({ name: "To Delete", description: "Temp", parent_coach: testUsers.coach._id });
            const res = await request(app)
                .delete(`/group/delete/${groupToDelete._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            const deleted = await Group.findById(groupToDelete._id);
            expect(deleted).toBeNull();
        });

        it("coach cannot delete another coach's group", async () => {
            const res = await request(app)
                .delete(`/group/delete/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);
            expect(res.statusCode).toBe(403);
        });

        it("admin can delete any group", async () => {
            const groupToDelete = await Group.create({ name: "Admin Delete", description: "Temp", parent_coach: testUsers.coach._id });
            const res = await request(app)
                .delete(`/group/delete/${groupToDelete._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            const deleted = await Group.findById(groupToDelete._id);
            expect(deleted).toBeNull();
        });

        it("student cannot delete group", async () => {
            const res = await request(app)
                .delete(`/group/delete/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/group/delete/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
