const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const CFAccount = require('../models/CFAccount');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const StudentGroup = require('../models/StudentGroup');

describe('Assignment API', () => {
    let adminToken;
    let studentToken;
    let coachToken;
    let coachToken2;
    let testUsers = {};
    let testGroups = {};
    let testAssignments = {};

    const createAndLoginUser = async ({ username, password, role }) => {
        const user = await User.create({ username, password_hash: password, email: `${username}@test.com`, role });
        
        // Create CFAccount for students so they have cf_handle in JWT
        if (role === "student") {
            await CFAccount.create({ student_id: user._id, cf_account: `${username}_cf`, is_verified_flag: true });
        }
        
        const res = await request(app)
            .post('/auth/login')
            .send({ username, password });
        return { user, token: res.body.token };
    };

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);

        ({ user: testUsers.admin, token: adminToken } = await createAndLoginUser({
            username: 'admin',
            password: 'adminpass',
            role: 'admin'
        }));

        ({ user: testUsers.coach, token: coachToken } = await createAndLoginUser({
            username: 'coach',
            password: 'coachpass',
            role: 'coach'
        }));

        ({ user: testUsers.coach2, token: coachToken2 } = await createAndLoginUser({
            username: 'coach2',
            password: 'coach2pass',
            role: 'coach'
        }));

        ({ user: testUsers.student, token: studentToken } = await createAndLoginUser({
            username: 'student',
            password: 'studentpass',
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

        await StudentGroup.create({ student_id: testUsers.student._id, group_id: testGroups.coachGroup._id });

        const coachAssignmentRes = await request(app)
            .post('/assignment/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ title: 'Coach Assignment', description: 'Assignment for coach', due_date: new Date(), parent_group: testGroups.coachGroup._id });
        testAssignments.coachAssignment = coachAssignmentRes.body;

        const coach2AssignmentRes = await request(app)
            .post('/assignment/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({ title: 'Coach2 Assignment', description: 'Assignment for coach2', due_date: new Date(), parent_group: testGroups.coach2Group._id });
        testAssignments.coach2Assignment = coach2AssignmentRes.body;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('Create assignment', () => {
        it('coach can create a new assignment for their group', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'New Assignment', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.title).toBe('New Assignment');
        });

        it('coach cannot create assignment for another coach\'s group', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'New Assignment', description: 'Description', due_date: new Date(), parent_group: testGroups.coach2Group._id });
            expect(res.status).toBe(403);
        });

        it('admin can create a new assignment for any group', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Admin Assignment', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Admin Assignment');
        });

        it('student cannot create an assignment', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ title: 'Student Assignment', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            expect(res.status).toBe(403);
        });

        it('unauthenticated user cannot create assignment', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .send({ title: 'Unauth Assignment', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            expect(res.status).toBe(401);
        });

        it('returns 400 for missing title', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            expect(res.status).toBe(400);
        });

        it('returns 400 for missing parent_group', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'Title', description: 'Description', due_date: new Date() });
            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid group', async () => {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'Title', description: 'Description', due_date: new Date(), parent_group: 'invalid' });
            expect(res.status).toBe(400);
        });
    });

    describe('Get assignments', () => {
        it('coach can get their own assignments', async () => {
            const res = await request(app)
                .get('/assignment/get')
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.some(a => a.title === 'Coach Assignment')).toBe(true);
        });

        it('coach cannot get another coach\'s assignments', async () => {
            const res = await request(app)
                .get('/assignment/get')
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(res.body.every(a => a.parent_group === testGroups.coachGroup._id.toString())).toBe(true);
        });

        it('student can get assignments for groups they belong to', async () => {
            const res = await request(app)
                .get('/assignment/get')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every(a => a.parent_group === testGroups.coachGroup._id.toString())).toBe(true);
        });

        it('admin can get all assignments', async () => {
            const res = await request(app)
                .get('/assignment/get')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(1);
        });

        it('unauthenticated user cannot get assignments', async () => {
            const res = await request(app)
                .get('/assignment/get');
            expect(res.status).toBe(401);
        });
    });

    describe('Get assignment by id', () => {
        it('coach can get their own assignment by id', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Coach Assignment');
        });

        it('coach cannot get another coach\'s assignment', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coach2Assignment._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(403);
        });

        it('student can get assignment for group they belong to', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Coach Assignment');
        });

        it('student cannot get assignment for group they don\'t belong to', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coach2Assignment._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(403);
        });

        it('admin can get any assignment by id', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Coach Assignment');
        });

        it('returns 404 for non-existent assignment', async () => {
            const res = await request(app)
                .get('/assignment/get/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot get assignment', async () => {
            const res = await request(app)
                .get(`/assignment/get/${testAssignments.coachAssignment._id}`);
            expect(res.status).toBe(401);
        });
    });

    describe('Update assignment', () => {
        it('coach can update their own assignment', async () => {
            const res = await request(app)
                .put(`/assignment/update/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'Updated Assignment' });
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated Assignment');
        });

        it('coach cannot update another coach\'s assignment', async () => {
            const res = await request(app)
                .put(`/assignment/update/${testAssignments.coach2Assignment._id}`)
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'Updated' });
            expect(res.status).toBe(403);
        });

        it('admin can update any assignment', async () => {
            const res = await request(app)
                .put(`/assignment/update/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Admin Updated' });
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Admin Updated');
        });

        it('student cannot update assignment', async () => {
            const res = await request(app)
                .put(`/assignment/update/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ title: 'Student Update' });
            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent assignment', async () => {
            const res = await request(app)
                .put('/assignment/update/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Update' });
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot update assignment', async () => {
            const res = await request(app)
                .put(`/assignment/update/${testAssignments.coachAssignment._id}`)
                .send({ title: 'Update' });
            expect(res.status).toBe(401);
        });
    });

    describe('Delete assignment', () => {
        it('coach can delete their own assignment', async () => {
            const createRes = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'To Delete', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            const assignmentId = createRes.body._id;

            const res = await request(app)
                .delete(`/assignment/delete/${assignmentId}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
        });

        it('coach cannot delete another coach\'s assignment', async () => {
            const res = await request(app)
                .delete(`/assignment/delete/${testAssignments.coach2Assignment._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(403);
        });

        it('admin can delete any assignment', async () => {
            const createRes = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ title: 'To Delete by Admin', description: 'Description', due_date: new Date(), parent_group: testGroups.coachGroup._id });
            const assignmentId = createRes.body._id;

            const res = await request(app)
                .delete(`/assignment/delete/${assignmentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('student cannot delete assignment', async () => {
            const res = await request(app)
                .delete(`/assignment/delete/${testAssignments.coachAssignment._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent assignment', async () => {
            const res = await request(app)
                .delete('/assignment/delete/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot delete assignment', async () => {
            const res = await request(app)
                .delete(`/assignment/delete/${testAssignments.coachAssignment._id}`);
            expect(res.status).toBe(401);
        });
    });
});
