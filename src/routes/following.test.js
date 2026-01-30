const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const Following = require("../models/Following");

describe("Following API", () => {
    let adminToken;
    let studentToken1;
    let studentToken2;
    let student1;
    let student2;
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
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe("POST /following/create", () => {
        it("creates a following as a student", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    student_2_id: student2._id.toString()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.student_1_id).toBe(student1._id.toString());
            expect(res.body.student_2_id).toBe(student2._id.toString());
        });

        it("creates a following as admin", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    student_1_id: student2._id.toString(),
                    student_2_id: student1._id.toString()
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.student_1_id).toBe(student2._id.toString());
            expect(res.body.student_2_id).toBe(student1._id.toString());
        });

        it("rejects creating following self", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    student_2_id: student1._id.toString()
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Can't follow self");
        });

        it("rejects invalid student_1_id", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    student_1_id: "invalid",
                    student_2_id: student2._id.toString()
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid student_1_id");
        });

        it("rejects invalid student_2_id", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    student_1_id: student1._id.toString(),
                    student_2_id: "invalid"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid student_2_id");
        });

        it("rejects student creating for another user", async () => {
            const res = await request(app)
                .post("/following/create")
                .set("Authorization", `Bearer ${studentToken1}`)
                .send({
                    student_1_id_p: student2._id.toString(),
                    student_2_id: admin._id.toString()
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Invalid student_2_id");
        });
    });

    describe("GET /following/get", () => {
        let following1;
        let following2;

        beforeAll(async () => {
            await Following.deleteMany({});
            following1 = await Following.create({ student_1_id: student1._id, student_2_id: student2._id });
            following2 = await Following.create({ student_1_id: student2._id, student_2_id: student1._id });
        });

        it("gets all followings as admin", async () => {
            const res = await request(app)
                .get("/following/get")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it("gets own followings as student", async () => {
            const res = await request(app)
                .get("/following/get")
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.every(f => f.student_1_id === student1._id.toString())).toBe(true);
        });

        it("filters by student_1_id", async () => {
            const res = await request(app)
                .get(`/following/get?student_1_id=${student1._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.every(f => f.student_1_id === student1._id.toString())).toBe(true);
        });

        it("filters by student_2_id", async () => {
            const res = await request(app)
                .get(`/following/get?student_2_id=${student2._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.every(f => f.student_2_id === student2._id.toString())).toBe(true);
        });
    });

    describe("GET /following/get/:id", () => {
        let following;

        beforeAll(async () => {
            await Following.deleteMany({});
            following = await Following.create({ student_1_id: student1._id, student_2_id: student2._id });
        });

        it("gets following by id as admin", async () => {
            const res = await request(app)
                .get(`/following/get/${following._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(following._id.toString());
            expect(res.body.student_1_id).toBe(student1._id.toString());
            expect(res.body.student_2_id).toBe(student2._id.toString());
        });

        it("returns 404 for non-existent following", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/following/get/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Following not found");
        });
    });

    describe("DELETE /following/delete/:id", () => {
        let following;

        beforeEach(async () => {
            await Following.deleteMany({});
            following = await Following.create({ student_1_id: student1._id, student_2_id: student2._id });
        });

        it("deletes following as student (own)", async () => {
            const res = await request(app)
                .delete(`/following/delete/${following._id}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Following deleted successfully");

            const deleted = await Following.findById(following._id);
            expect(deleted).toBeNull();
        });

        it("deletes following as admin", async () => {
            const res = await request(app)
                .delete(`/following/delete/${following._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Following deleted successfully");
        });

        it("rejects deleting others' following as student", async () => {
            const otherFollowing = await Following.create({ student_1_id: student2._id, student_2_id: student1._id });
            const res = await request(app)
                .delete(`/following/delete/${otherFollowing._id}`)
                .set("Authorization", `Bearer ${studentToken1}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("You do not have permission to delete this following");
        });

        it("returns 404 for non-existent following", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/following/delete/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Following not found");
        });
    });

    describe("GET /following/count/:user_id", () => {
        beforeAll(async () => {
            await Following.deleteMany({});
            await Following.create({ student_1_id: student1._id, student_2_id: student2._id });
            await Following.create({ student_1_id: admin._id, student_2_id: student2._id });
        });

        it("gets follower count", async () => {
            const res = await request(app)
                .get(`/following/count/${student2._id}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("count");
            expect(typeof res.body.count).toBe("number");
        });
    });

    describe("GET /following", () => {
        beforeAll(async () => {
            await Following.deleteMany({});
            await Following.create({ student_1_id: student1._id, student_2_id: student2._id });
            
            const student3Res = await createAndLoginUser({
                username: "student3",
                password: "studentpass",
                role: "student"
            });
            
            await Following.create({ student_1_id: student1._id, student_2_id: student3Res.user._id });
        });

        it("student can get their followings list", async () => {
            const res = await request(app)
                .get("/following")
                .set("Authorization", `Bearer ${studentToken1}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("following");
            expect(Array.isArray(res.body.following)).toBe(true);
            expect(res.body.following.length).toBe(2);
            expect(res.body.following[0]).toHaveProperty("_id");
            expect(res.body.following[0]).toHaveProperty("name");
            expect(res.body.following[0].name).toBe("student2");
            expect(res.body.following[0]).toHaveProperty("student_id");
            expect(res.body.following[0].student_id).toBe(student2._id.toString());
        });

        it("student with no followings returns empty list", async () => {
            const res = await request(app)
                .get("/following")
                .set("Authorization", `Bearer ${studentToken2}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("following");
            expect(Array.isArray(res.body.following)).toBe(true);
            expect(res.body.following.length).toBe(0);
        });

        it("admin cannot access this endpoint", async () => {
            const res = await request(app)
                .get("/following")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Access denied. Students only.");
        });

        it("unauthenticated user cannot access", async () => {
            const res = await request(app)
                .get("/following");

            expect(res.statusCode).toBe(401);
        });
    });
});
