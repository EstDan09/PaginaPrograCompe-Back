const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Exercise = require('../models/Exercise');
const StudentGroup = require('../models/StudentGroup');

const createAndLoginUser = async (userData) => {
    const user = await User.create({ 
        username: userData.username, 
        password_hash: userData.password, 
        email: `${userData.username}@test.com`, 
        role: userData.role 
    });
    
    const loginRes = await request(app)
        .post('/auth/login')
        .send({ username: userData.username, password: userData.password });

    return {
        user,
        token: loginRes.body.token
    };
};

describe('Exercise API', () => {
    let adminToken, coachToken, coachToken2, studentToken;
    let testUsers = {};
    let testGroups = {};
    let testAssignments = {};
    let testExercises = {};

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
            .send({ title: 'Coach Assignment', description: 'Assignment for coach', dueDate: new Date(), parent_group: testGroups.coachGroup._id });
        testAssignments.coachAssignment = coachAssignmentRes.body;

        const coach2AssignmentRes = await request(app)
            .post('/assignment/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({ title: 'Coach2 Assignment', description: 'Assignment for coach2', dueDate: new Date(), parent_group: testGroups.coach2Group._id });
        testAssignments.coach2Assignment = coach2AssignmentRes.body;

        const coachExerciseRes = await request(app)
            .post('/exercise/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ name: 'Coach Exercise', cf_code: '1234A', parent_assignment: testAssignments.coachAssignment._id });
        testExercises.coachExercise = coachExerciseRes.body;

        const coach2ExerciseRes = await request(app)
            .post('/exercise/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({ name: 'Coach2 Exercise', cf_code: '1234B', parent_assignment: testAssignments.coach2Assignment._id });
        testExercises.coach2Exercise = coach2ExerciseRes.body;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('Create exercise', () => {
        it('coach can create a new exercise for their assignment', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'New Exercise', cf_code: '1234C', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toBe('New Exercise');
            expect(res.body.cf_code).toBe('1234C');
        });

        it('coach cannot create exercise for another coach\'s assignment', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Unauthorized Exercise', cf_code: '1234D', parent_assignment: testAssignments.coach2Assignment._id });
            expect(res.status).toBe(403);
        });

        it('admin can create a new exercise for any assignment', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Admin Exercise', cf_code: '1234E', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(201);
        });

        it('student cannot create an exercise', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ name: 'Student Exercise', cf_code: '1234F', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(403);
        });

        it('returns 400 for missing name', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ cf_code: '1234G', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(400);
        });

        it('returns 400 for missing cf_code', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Exercise', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(400);
        });

        it('returns 400 for missing parent_assignment', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Exercise', cf_code: '1234H' });
            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid parent_assignment', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Exercise', cf_code: '1234I', parent_assignment: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('unauthenticated user cannot create exercise', async () => {
            const res = await request(app)
                .post('/exercise/create')
                .send({ name: 'Exercise', cf_code: '1234J', parent_assignment: testAssignments.coachAssignment._id });
            expect(res.status).toBe(401);
        });
    });

    describe('Get exercises', () => {
        it('coach can get their own exercises', async () => {
            const res = await request(app)
                .get('/exercise/get')
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every(e => e.parent_assignment === testAssignments.coachAssignment._id.toString())).toBe(true);
        });

        it('coach cannot get another coach\'s exercises', async () => {
            const res = await request(app)
                .get('/exercise/get')
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(res.body.every(e => e.parent_assignment !== testAssignments.coach2Assignment._id.toString())).toBe(true);
        });

        it('student can get exercises for assignments in groups they belong to', async () => {
            const res = await request(app)
                .get('/exercise/get')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every(e => e.parent_assignment === testAssignments.coachAssignment._id.toString())).toBe(true);
        });

        it('admin can get all exercises', async () => {
            const res = await request(app)
                .get('/exercise/get')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(1);
        });

        it('unauthenticated user cannot get exercises', async () => {
            const res = await request(app)
                .get('/exercise/get');
            expect(res.status).toBe(401);
        });
    });

    describe('Get exercise by id', () => {
        it('coach can get their own exercise by id', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testExercises.coachExercise._id);
        });

        it('coach cannot get another coach\'s exercise', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coach2Exercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(403);
        });

        it('student can get exercise for assignment in group they belong to', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testExercises.coachExercise._id);
        });

        it('student cannot get exercise for assignment in group they don\'t belong to', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coach2Exercise._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(403);
        });

        it('admin can get any exercise by id', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('returns 404 for non-existent exercise', async () => {
            const res = await request(app)
                .get('/exercise/get/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot get exercise', async () => {
            const res = await request(app)
                .get(`/exercise/get/${testExercises.coachExercise._id}`);
            expect(res.status).toBe(401);
        });
    });

    describe('Update exercise', () => {
        it('coach can update their own exercise', async () => {
            const res = await request(app)
                .put(`/exercise/update/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Updated Exercise' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Exercise');
        });

        it('coach cannot update another coach\'s exercise', async () => {
            const res = await request(app)
                .put(`/exercise/update/${testExercises.coach2Exercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'Unauthorized Update' });
            expect(res.status).toBe(403);
        });

        it('admin can update any exercise', async () => {
            const res = await request(app)
                .put(`/exercise/update/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Admin Updated' });
            expect(res.status).toBe(200);
        });

        it('student cannot update exercise', async () => {
            const res = await request(app)
                .put(`/exercise/update/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ name: 'Student Update' });
            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent exercise', async () => {
            const res = await request(app)
                .put('/exercise/update/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Update' });
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot update exercise', async () => {
            const res = await request(app)
                .put(`/exercise/update/${testExercises.coachExercise._id}`)
                .send({ name: 'Update' });
            expect(res.status).toBe(401);
        });
    });

    describe('Delete exercise', () => {
        it('coach can delete their own exercise', async () => {
            const createRes = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'To Delete', cf_code: '1234K', parent_assignment: testAssignments.coachAssignment._id });
            const exerciseId = createRes.body._id;

            const res = await request(app)
                .delete(`/exercise/delete/${exerciseId}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(200);
        });

        it('coach cannot delete another coach\'s exercise', async () => {
            const res = await request(app)
                .delete(`/exercise/delete/${testExercises.coach2Exercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`);
            expect(res.status).toBe(403);
        });

        it('admin can delete any exercise', async () => {
            const createRes = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: 'To Delete by Admin', cf_code: '1234L', parent_assignment: testAssignments.coachAssignment._id });
            const exerciseId = createRes.body._id;

            const res = await request(app)
                .delete(`/exercise/delete/${exerciseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('student cannot delete exercise', async () => {
            const res = await request(app)
                .delete(`/exercise/delete/${testExercises.coachExercise._id}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent exercise', async () => {
            const res = await request(app)
                .delete('/exercise/delete/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('unauthenticated user cannot delete exercise', async () => {
            const res = await request(app)
                .delete(`/exercise/delete/${testExercises.coachExercise._id}`);
            expect(res.status).toBe(401);
        });
    });
});
