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

    describe("Create group invite code", () => {
        it("coach can create invite code for their own group", async () => {
            const res = await request(app)
                .post(`/group/create-invite-code/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("invite_code");
            expect(typeof res.body.invite_code).toBe("string");
            expect(res.body.invite_code.length).toBeGreaterThan(0);
        });

        it("admin can create invite code for any group", async () => {
            const res = await request(app)
                .post(`/group/create-invite-code/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("invite_code");
        });

        it("coach cannot create invite code for another coach's group", async () => {
            const res = await request(app)
                .post(`/group/create-invite-code/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/group/create-invite-code/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        it("student cannot create invite code", async () => {
            const res = await request(app)
                .post(`/group/create-invite-code/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("unauthenticated user cannot create invite code", async () => {
            const res = await request(app)
                .post(`/group/create-invite-code/${testGroups.coachGroup._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Get group invite code", () => {
        beforeEach(async () => {
            const groupRes = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken2}`)
                .send({ name: "Group with Invite", description: "Testing invite codes" });
            testGroups.inviteGroup = groupRes.body;

            await request(app)
                .post(`/group/create-invite-code/${testGroups.inviteGroup._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);
        });

        it("coach can get invite code for their own group", async () => {
            const res = await request(app)
                .get(`/group/get-invite-code/${testGroups.inviteGroup._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("invite_code");
            expect(typeof res.body.invite_code).toBe("string");
        });

        it("admin can get invite code for any group", async () => {
            const res = await request(app)
                .get(`/group/get-invite-code/${testGroups.inviteGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("invite_code");
        });

        it("coach cannot get invite code for another coach's group", async () => {
            const res = await request(app)
                .get(`/group/get-invite-code/${testGroups.inviteGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 when group has no invite code", async () => {
            const freshGroupRes = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken2}`)
                .send({ name: "Fresh Group No Code", description: "Testing" });
            const freshGroup = freshGroupRes.body;

            const res = await request(app)
                .get(`/group/get-invite-code/${freshGroup._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No invite code found for this group");
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/group/get-invite-code/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        it("student cannot get invite code", async () => {
            const res = await request(app)
                .get(`/group/get-invite-code/${testGroups.inviteGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("unauthenticated user cannot get invite code", async () => {
            const res = await request(app)
                .get(`/group/get-invite-code/${testGroups.inviteGroup._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Delete group invite code", () => {
        it("coach can delete invite code for their own group", async () => {
            const groupRes = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken2}`)
                .send({ name: "Group to Delete Code", description: "Testing" });
            const groupWithCode = groupRes.body;

            await request(app)
                .post(`/group/create-invite-code/${groupWithCode._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);

            const res = await request(app)
                .delete(`/group/delete-invite-code/${groupWithCode._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Invite code deleted successfully");

            const verifyRes = await request(app)
                .get(`/group/get-invite-code/${groupWithCode._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);
            expect(verifyRes.statusCode).toBe(404);
        });

        it("admin can delete invite code for any group", async () => {
            const groupRes = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken2}`)
                .send({ name: "Admin Delete Code", description: "Testing" });
            const groupWithCode = groupRes.body;

            await request(app)
                .post(`/group/create-invite-code/${groupWithCode._id}`)
                .set("Authorization", `Bearer ${coachToken2}`);

            const res = await request(app)
                .delete(`/group/delete-invite-code/${groupWithCode._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });

        it("coach cannot delete invite code for another coach's group", async () => {
            const res = await request(app)
                .delete(`/group/delete-invite-code/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("returns 400 when group has no invite code to delete", async () => {
            const freshGroupRes = await request(app)
                .post("/group/create")
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ name: "Fresh Group No Code Del", description: "Testing" });
            const freshGroup = freshGroupRes.body;

            const res = await request(app)
                .delete(`/group/delete-invite-code/${freshGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No invite code to delete");
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/group/delete-invite-code/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        it("student cannot delete invite code", async () => {
            const res = await request(app)
                .delete(`/group/delete-invite-code/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("unauthenticated user cannot delete invite code", async () => {
            const res = await request(app)
                .delete(`/group/delete-invite-code/${testGroups.coachGroup._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Get group messages", () => {
        it("coach can get messages from their own group", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it("student can get messages from their group", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it("student cannot get messages from group they don't belong to", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("coach cannot get messages from another coach's group", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it("admin can get messages from any group", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/group/get-messages/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
        });

        it("unauthenticated user cannot get messages", async () => {
            const res = await request(app)
                .get(`/group/get-messages/${testGroups.coachGroup._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Send group message", () => {
        it("coach can send message to their own group", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message: "Hello from coach!" });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("sender_id");
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("timestamp");
            expect(res.body.sender_id).toBe(testUsers.coach._id.toString());
            expect(res.body.message).toBe("Hello from coach!");
        });

        it("student can send message to their group", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ message: "Hi from student!" });

            expect(res.statusCode).toBe(201);
            expect(res.body.sender_id).toBe(testUsers.student._id.toString());
            expect(res.body.message).toBe("Hi from student!");
        });

        it("student cannot send message to group they don't belong to", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ message: "Unauthorized message" });

            expect(res.statusCode).toBe(403);
        });

        it("coach cannot send message to another coach's group", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message: "Unauthorized message" });

            expect(res.statusCode).toBe(403);
        });

        it("admin can send message to any group", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ message: "Message from admin" });

            expect(res.statusCode).toBe(201);
            expect(res.body.sender_id).toBe(testUsers.admin._id.toString());
        });

        it("returns 400 when message is empty", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message: "" });

            expect(res.statusCode).toBe(400);
        });

        it("returns 400 when message text is missing", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Message text is required");
        });

        it("returns 400 when message exceeds 1000 characters", async () => {
            const longMessage = "x".repeat(1001);
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message: longMessage });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain("exceeds maximum length");
        });

        it("message is stored in group and can be retrieved", async () => {
            const message = "Test message for retrieval";
            const sendRes = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message });

            expect(sendRes.statusCode).toBe(201);

            const getRes = await request(app)
                .get(`/group/get-messages/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(getRes.statusCode).toBe(200);
            const foundMessage = getRes.body.find(msg => msg.message === message);
            expect(foundMessage).toBeDefined();
            expect(foundMessage.sender_id).toBe(testUsers.coach._id.toString());
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/group/send-message/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ message: "Test message" });

            expect(res.statusCode).toBe(404);
        });

        it("message timestamp is set correctly", async () => {
            const beforeSend = Date.now();
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`)
                .send({ message: "Timestamp test" });
            const afterSend = Date.now();

            expect(res.statusCode).toBe(201);
            const msgTimestamp = new Date(res.body.timestamp).getTime();
            expect(msgTimestamp).toBeGreaterThanOrEqual(beforeSend);
            expect(msgTimestamp).toBeLessThanOrEqual(afterSend);
        });

        it("unauthenticated user cannot send message", async () => {
            const res = await request(app)
                .post(`/group/send-message/${testGroups.coachGroup._id}`)
                .send({ message: "Unauthorized message" });

            expect(res.statusCode).toBe(401);
        });
    });

    describe("Get my groups summary", () => {
        it("admin cannot get groups summary (access denied)", async () => {
            const res = await request(app)
                .get("/group/my-groups-summary")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied");
        });

        it("unauthenticated user cannot get groups summary", async () => {
            const res = await request(app)
                .get("/group/my-groups-summary");

            expect(res.statusCode).toBe(401);
        });

        it("student with no groups returns empty array", async () => {
            const newStudent = await User.create({ username: "nostudent", password_hash: "pass", email: "nostudent@test.com", role: "student" });
            await CFAccount.create({ student_id: newStudent._id, cf_account: "nostudent_cf", is_verified_flag: true });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ username: "nostudent", password: "pass" });

            const res = await request(app)
                .get("/group/my-groups-summary")
                .set("Authorization", `Bearer ${loginRes.body.token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it("coach with no groups returns empty array", async () => {
            const newCoach = await User.create({ username: "newcoach", password_hash: "pass", email: "newcoach@test.com", role: "coach" });

            const loginRes = await request(app)
                .post("/auth/login")
                .send({ username: "newcoach", password: "pass" });

            const res = await request(app)
                .get("/group/my-groups-summary")
                .set("Authorization", `Bearer ${loginRes.body.token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it("student with a group gets one group", async () => {
            const res = await request(app)
                .get("/group/my-groups-summary")
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
        });
    });

    describe("Get group details", () => {
        it("coach can get details of their own group", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("group");
            expect(res.body).toHaveProperty("assignments");
            expect(res.body.group._id).toBe(testGroups.coachGroup._id.toString());
            expect(res.body.group).toHaveProperty("name");
            expect(res.body.group).toHaveProperty("description");
            expect(res.body.group).toHaveProperty("owner");
            expect(Array.isArray(res.body.assignments)).toBe(true);
        });

        it("student can get details of their group", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("group");
            expect(res.body).toHaveProperty("assignments");
            expect(res.body.group._id).toBe(testGroups.coachGroup._id.toString());
        });

        it("student cannot get details of group they don't belong to", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied");
        });

        it("coach cannot get details of another coach's group", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.adminGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied");
        });

        it("admin can get details of any group", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.group._id).toBe(testGroups.coachGroup._id.toString());
        });

        it("returns 404 for non-existent group", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/group/details/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Group not found");
        });

        it("returns 404 for invalid group id format", async () => {
            const res = await request(app)
                .get(`/group/details/invalid-id`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Group not found");
        });

        it("group details includes owner information", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.group.owner).toBeDefined();
            expect(res.body.group.owner._id).toBe(testUsers.coach._id.toString());
            expect(res.body.group.owner.username).toBe("coach");
            expect(res.body.group.owner.role).toBe("coach");
        });

        it("group details includes assignments with exercise count", async () => {
            const assignment = await require("../models/Assignment").create({
                title: "Test Assignment",
                description: "Test Description",
                parent_group: testGroups.coachGroup._id,
                parent_coach: testUsers.coach._id,
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`)
                .set("Authorization", `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.assignments)).toBe(true);
            const testAssignment = res.body.assignments.find(a => a._id === assignment._id.toString());
            expect(testAssignment).toBeDefined();
            expect(testAssignment).toHaveProperty("exerciseCount");
            expect(testAssignment).toHaveProperty("title");
            expect(testAssignment.title).toBe("Test Assignment");
            expect(testAssignment).toHaveProperty("description");
            expect(testAssignment).toHaveProperty("due_date");
        });

        it("unauthenticated user cannot get group details", async () => {
            const res = await request(app)
                .get(`/group/details/${testGroups.coachGroup._id}`);

            expect(res.statusCode).toBe(401);
        });
    });
});
