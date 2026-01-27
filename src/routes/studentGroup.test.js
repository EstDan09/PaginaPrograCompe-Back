const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const CFAccount = require('../models/CFAccount');
const Group = require('../models/Group');
const StudentGroup = require('../models/StudentGroup');

const createAndLoginUser = async (userData) => {
    const user = await User.create({
        username: userData.username,
        password_hash: userData.password,
        email: `${userData.username}@test.com`,
        role: userData.role
    });

    if (userData.role === 'student') {
        await CFAccount.create({ student_id: user._id, cf_account: `${userData.username}_cf`, is_verified_flag: true });
    }

    const loginRes = await request(app)
        .post('/auth/login')
        .send({ username: userData.username, password: userData.password });

    return {
        user,
        token: loginRes.body.token
    };
};

describe('StudentGroup API', () => {
    let adminToken, coachToken, coachToken2, studentToken, studentToken2, studentToken3;
    let testUsers = {};
    let testGroups = {};
    let testStudentGroups = {};

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);

        ({ user: testUsers.admin, token: adminToken } = await createAndLoginUser({
            username: 'admin-sg',
            password: 'adminpass',
            role: 'admin'
        }));

        ({ user: testUsers.coach, token: coachToken } = await createAndLoginUser({
            username: 'coach-sg',
            password: 'coachpass',
            role: 'coach'
        }));

        ({ user: testUsers.coach2, token: coachToken2 } = await createAndLoginUser({
            username: 'coach2-sg',
            password: 'coach2pass',
            role: 'coach'
        }));

        ({ user: testUsers.student, token: studentToken } = await createAndLoginUser({
            username: 'student-sg',
            password: 'studentpass',
            role: 'student'
        }));

        ({ user: testUsers.student2, token: studentToken2 } = await createAndLoginUser({
            username: 'student2-sg',
            password: 'student2pass',
            role: 'student'
        }));

        ({ user: testUsers.student3, token: studentToken3 } = await createAndLoginUser({
            username: 'student3-sg',
            password: 'student2pass',
            role: 'student'
        }));

        const coachGroupRes = await request(app)
            .post('/group/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ name: 'Coach Group', description: 'Group for coach' });
        testGroups.coachGroup = coachGroupRes.body;

        const coach2GroupRes = await request(app)
            .post('/group/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({ name: 'Coach2 Group', description: 'Group for coach2' });
        testGroups.coach2Group = coach2GroupRes.body;

        const sg2Res = await request(app)
            .post('/student-group/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ student_id: testUsers.student2._id.toString(), group_id: testGroups.coachGroup._id });
        testStudentGroups.sg2 = sg2Res.body;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('Create student group', () => {
        it('coach can create student group for their own group', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ student_id: testUsers.student3._id.toString(), group_id: testGroups.coachGroup._id });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.student_id).toBe(testUsers.student3._id.toString());
            expect(res.body.group_id).toBe(testGroups.coachGroup._id);
        });

        it('coach cannot create student group for another coach group', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coach2Group._id });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('You do not have permission to add students to this group');
        });

        it('admin can create student group for any group', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coach2Group._id });

            expect(res.statusCode).toBe(201);
            expect(res.body.student_id).toBe(testUsers.student._id.toString());
            expect(res.body.group_id).toBe(testGroups.coach2Group._id);
        });

        it('returns 400 for invalid student_id', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: 'invalid-student-id', group_id: testGroups.coachGroup._id });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid student_id');
        });

        it('returns 400 for invalid group_id', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: 'invalid-group-id' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid group_id');
        });

        it('returns 400 for non-student user', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: testUsers.coach._id.toString(), group_id: testGroups.coachGroup._id });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid student_id');
        });

        it('returns 400 for non-existent group', async () => {
            const fakeGroupId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: fakeGroupId.toString() });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid group_id');
        });

        it('student cannot create student group', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coachGroup._id });

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot create student group', async () => {
            const res = await request(app)
                .post('/student-group/create')
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coachGroup._id });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Get student groups', () => {
        it('student can get their own student groups', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach(sg => {
                expect(sg.student_id).toBe(testUsers.student._id.toString());
            });
        });

        it('student cannot specify student_id', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .query({ student_id: testUsers.student2._id.toString() })
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Access denied');
        });

        it('coach can get student groups for their groups', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(sg => {
                expect(sg.group_id).toBe(testGroups.coachGroup._id);
            });
        });

        it('coach can filter by their own group_id', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .query({ group_id: testGroups.coachGroup._id })
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(sg => {
                expect(sg.group_id).toBe(testGroups.coachGroup._id);
            });
        });

        it('coach cannot get student groups for another coach groups', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .query({ group_id: testGroups.coach2Group._id })
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('You do not have permission to view student groups for this group');
        });

        it('admin can get all student groups', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('admin can filter by student_id', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .query({ student_id: testUsers.student._id.toString() })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(sg => {
                expect(sg.student_id).toBe(testUsers.student._id.toString());
            });
        });

        it('admin can filter by group_id', async () => {
            const res = await request(app)
                .get('/student-group/get')
                .query({ group_id: testGroups.coachGroup._id })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(sg => {
                expect(sg.group_id).toBe(testGroups.coachGroup._id);
            });
        });

        it('unauthenticated user cannot get student groups', async () => {
            const res = await request(app)
                .get('/student-group/get');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Get student group by id', () => {
        it('admin can get student group by id', async () => {
            const res = await request(app)
                .get(`/student-group/get/${testStudentGroups.sg2._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.student_id).toBe(testUsers.student2._id.toString());
            expect(res.body.group_id).toBe(testGroups.coachGroup._id);
        });

        it('returns 404 for non-existent student group', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/student-group/get/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('StudentGroup not found');
        });

        it('coach cannot get student group by id', async () => {
            const res = await request(app)
                .get(`/student-group/get/${testStudentGroups.sg2._id}`)
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('student cannot get student group by id', async () => {
            const res = await request(app)
                .get(`/student-group/get/${testStudentGroups.sg2._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot get student group by id', async () => {
            const res = await request(app)
                .get(`/student-group/get/${testStudentGroups.sg2._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Delete student group', () => {
        it('coach can delete student group from their own group', async () => {
            const newSGRes = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coachGroup._id });
            const newSG = newSGRes.body;

            const res = await request(app)
                .delete(`/student-group/delete/${newSG._id}`)
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('StudentGroup deleted successfully');
        });

        it('coach cannot delete student group from another coach group', async () => {
            const res = await request(app)
                .delete(`/student-group/delete/${testStudentGroups.sg2._id}`)
                .set('Authorization', `Bearer ${coachToken2}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('You do not have permission to delete this student from the group');
        });

        it('admin can delete any student group', async () => {
            const newSGRes = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ student_id: testUsers.student._id.toString(), group_id: testGroups.coachGroup._id });
            const newSG = newSGRes.body;

            const res = await request(app)
                .delete(`/student-group/delete/${newSG._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('StudentGroup deleted successfully');
        });

        it('returns 404 for non-existent student group', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/student-group/delete/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('StudentGroup not found');
        });

        it('student cannot delete student group', async () => {
            const res = await request(app)
                .delete(`/student-group/delete/${testStudentGroups.sg2._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot delete student group', async () => {
            const res = await request(app)
                .delete(`/student-group/delete/${testStudentGroups.sg2._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Use group invite code', () => {
        let inviteGroup;
        let inviteCode;

        beforeEach(async () => {
            const groupRes = await request(app)
                .post('/group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Invite Code Test Group', description: 'For testing invite codes' });
            inviteGroup = groupRes.body;

            const codeRes = await request(app)
                .post(`/group/create-invite-code/${inviteGroup._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            inviteCode = codeRes.body.invite_code;
        });

        it('student can join group with valid invite code', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Successfully joined the group');

            const verifyRes = await request(app)
                .get('/student-group/get')
                .set('Authorization', `Bearer ${studentToken}`);
            
            const membership = verifyRes.body.find(sg => sg.group_id === inviteGroup._id);
            expect(membership).toBeDefined();
        });

        it('student cannot join group with invalid invite code', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: 'invalid-code-xyz' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Invalid invite code');
        });

        it('returns 400 when invite code is missing', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code is required');
        });

        it('returns 400 when invite code is empty string', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code is required');
        });

        it('student cannot join same group twice with invite code', async () => {
            const firstRes = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(firstRes.statusCode).toBe(200);

            const secondRes = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(secondRes.statusCode).toBe(400);
            expect(secondRes.body.message).toBe('You are already a member of this group');
        });

        it('multiple students can join group with same invite code', async () => {
            const res1 = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(res1.statusCode).toBe(200);

            const res2 = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken2}`)
                .send({ invite_code: inviteCode });

            expect(res2.statusCode).toBe(200);

            const memberRes = await request(app)
                .get('/student-group/get')
                .query({ group_id: inviteGroup._id })
                .set('Authorization', `Bearer ${coachToken}`);

            const memberIds = memberRes.body.map(sg => sg.student_id);
            expect(memberIds).toContain(testUsers.student._id.toString());
            expect(memberIds).toContain(testUsers.student2._id.toString());
        });

        it('unauthenticated user cannot use invite code', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(401);
        });

        it('coach cannot use invite code to join group', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(403);
        });

        it('admin cannot use invite code to join group', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(403);
        });

        it('student can still use invite code after other student joins', async () => {
            await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken2}`)
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(200);
        });

        it('deleted invite code cannot be used', async () => {
            const joinRes = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(joinRes.statusCode).toBe(200);

            await request(app)
                .delete(`/group/delete-invite-code/${inviteGroup._id}`)
                .set('Authorization', `Bearer ${coachToken}`);

            const failRes = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken3}`)
                .send({ invite_code: inviteCode });

            expect(failRes.statusCode).toBe(404);
            expect(failRes.body.message).toBe('Invalid invite code');
        });

        it('student is added to correct group when using invite code', async () => {
            const res = await request(app)
                .post('/student-group/use-invite-code')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ invite_code: inviteCode });

            expect(res.statusCode).toBe(200);

            const memberRes = await request(app)
                .get('/student-group/get')
                .set('Authorization', `Bearer ${studentToken}`);

            const membership = memberRes.body.find(sg => sg.group_id === inviteGroup._id);
            expect(membership).toBeDefined();
            expect(membership.student_id).toBe(testUsers.student._id.toString());
        });
    });
});
