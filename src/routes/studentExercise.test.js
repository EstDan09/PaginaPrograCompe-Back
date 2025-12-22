const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const Exercise = require('../models/Exercise');
const StudentGroup = require('../models/StudentGroup');
const StudentExercise = require('../models/StudentExercise');

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

describe('StudentExercise API', () => {
    let adminToken, coachToken, coachToken2, studentToken, studentToken2;
    let testUsers = {};
    let testGroups = {};
    let testAssignments = {};
    let testExercises = {};
    let testStudentExercises = {};

    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URI);
        await User.deleteMany({});
        await Group.deleteMany({});
        await StudentGroup.deleteMany({});
        await Assignment.deleteMany({});
        await Exercise.deleteMany({});
        await StudentExercise.deleteMany({});

        ({ user: testUsers.admin, token: adminToken } = await createAndLoginUser({
            username: 'admin-se',
            password: 'adminpass',
            role: 'admin'
        }));

        ({ user: testUsers.coach, token: coachToken } = await createAndLoginUser({
            username: 'coach-se',
            password: 'coachpass',
            role: 'coach'
        }));

        ({ user: testUsers.coach2, token: coachToken2 } = await createAndLoginUser({
            username: 'coach2-se',
            password: 'coach2pass',
            role: 'coach'
        }));

        ({ user: testUsers.student, token: studentToken } = await createAndLoginUser({
            username: 'student-se',
            password: 'studentpass',
            role: 'student'
        }));

        ({ user: testUsers.student2, token: studentToken2 } = await createAndLoginUser({
            username: 'student2-se',
            password: 'student2pass',
            role: 'student'
        }));

        // Create test groups
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

        // Add students to groups
        await StudentGroup.create({ student_id: testUsers.student._id, group_id: testGroups.coachGroup._id });
        await StudentGroup.create({ student_id: testUsers.student2._id, group_id: testGroups.coach2Group._id });

        // Create test assignments
        const coachAssignmentRes = await request(app)
            .post('/assignment/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({
                title: 'Coach Assignment',
                description: 'Assignment for coach',
                parent_group: testGroups.coachGroup._id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        testAssignments.coachAssignment = coachAssignmentRes.body;

        const coach2AssignmentRes = await request(app)
            .post('/assignment/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({
                title: 'Coach2 Assignment',
                description: 'Assignment for coach2',
                parent_group: testGroups.coach2Group._id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        testAssignments.coach2Assignment = coach2AssignmentRes.body;

        // Create test exercises
        const coachExerciseRes = await request(app)
            .post('/exercise/create')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({
                name: 'Coach Exercise',
                cf_code: '123A',
                parent_assignment: testAssignments.coachAssignment._id
            });
        testExercises.coachExercise = coachExerciseRes.body;

        const coach2ExerciseRes = await request(app)
            .post('/exercise/create')
            .set('Authorization', `Bearer ${coachToken2}`)
            .send({
                name: 'Coach2 Exercise',
                cf_code: '123B',
                parent_assignment: testAssignments.coach2Assignment._id
            });
        testExercises.coach2Exercise = coach2ExerciseRes.body;
    });

    afterAll(async () => {
        // Clean up
        await StudentExercise.deleteMany({});
        await Exercise.deleteMany({});
        await Assignment.deleteMany({});
        await StudentGroup.deleteMany({});
        await Group.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('Create student exercise', () => {
        it('student can create student exercise for themselves', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ exercise_id: testExercises.coachExercise._id });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('studentExercise');
            expect(res.body.studentExercise.student_id).toBe(testUsers.student._id.toString());
            expect(res.body.studentExercise.exercise_id).toBe(testExercises.coachExercise._id.toString());
            testStudentExercises.studentExercise = res.body.studentExercise;
        });

        it('student cannot create student exercise for another student', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ exercise_id: testExercises.coach2Exercise._id });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Student may not solve this exercise');
        });

        it('admin can create student exercise for any student', async () => {
            const res = await request(app)
                .post(`/student-exercise/create/${testUsers.student2._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ exercise_id: testExercises.coach2Exercise._id });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('studentExercise');
            expect(res.body.studentExercise.student_id).toBe(testUsers.student2._id.toString());
            expect(res.body.studentExercise.exercise_id).toBe(testExercises.coach2Exercise._id.toString());
            testStudentExercises.adminCreated = res.body.studentExercise;
        });

        it('admin cannot create student exercise for invalid student', async () => {
            const res = await request(app)
                .post('/student-exercise/create/invalid-student-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ exercise_id: testExercises.coachExercise._id });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid student_id');
        });

        it('admin cannot create student exercise for non-student user', async () => {
            const res = await request(app)
                .post(`/student-exercise/create/${testUsers.coach._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ exercise_id: testExercises.coachExercise._id });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid student_id');
        });

        it('returns 400 for invalid exercise_id', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ exercise_id: 'invalid-exercise-id' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid exercise_id');
        });

        it('returns 400 for missing exercise_id', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid exercise_id');
        });

        it('coach cannot create student exercise', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ exercise_id: testExercises.coachExercise._id });

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot create student exercise', async () => {
            const res = await request(app)
                .post('/student-exercise/create')
                .send({ exercise_id: testExercises.coachExercise._id });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Get student exercises', () => {
        it('student can get their own student exercises', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('studentExercises');
            expect(Array.isArray(res.body.studentExercises)).toBe(true);
            expect(res.body.studentExercises.length).toBeGreaterThan(0);
            expect(res.body.studentExercises[0].student_id).toBe(testUsers.student._id.toString());
        });

        it('student cannot get another student exercises', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ student_id: testUsers.student2._id.toString() })
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Access denied');
        });

        it('coach can get student exercises for their groups', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('studentExercises');
            expect(Array.isArray(res.body.studentExercises)).toBe(true);
        });

        it('coach cannot get student exercises for another coach groups', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ group_id: testGroups.coach2Group._id })
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('You do not have permission to view student exercises for this group');
        });

        it('admin can get all student exercises', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('studentExercises');
            expect(Array.isArray(res.body.studentExercises)).toBe(true);
            expect(res.body.studentExercises.length).toBe(2); // Both created exercises
        });

        it('can filter by exercise_id', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ exercise_id: testExercises.coachExercise._id })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.studentExercises.length).toBe(1);
            expect(res.body.studentExercises[0].exercise_id).toBe(testExercises.coachExercise._id.toString());
        });

        it('can filter by assignment_id', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ assignment_id: testAssignments.coachAssignment._id })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.studentExercises.length).toBe(1);
            expect(res.body.studentExercises[0].exercise_id).toBe(testExercises.coachExercise._id.toString());
        });

        it('can filter by group_id', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ group_id: testGroups.coachGroup._id })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.studentExercises.length).toBe(1);
            expect(res.body.studentExercises[0].exercise_id).toBe(testExercises.coachExercise._id.toString());
        });

        it('returns 400 when querying more than one filter', async () => {
            const res = await request(app)
                .get('/student-exercise/get')
                .query({ exercise_id: testExercises.coachExercise._id, assignment_id: testAssignments.coachAssignment._id })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Query at most one of group_id, assignment_id, or exercise_id');
        });

        it('unauthenticated user cannot get student exercises', async () => {
            const res = await request(app)
                .get('/student-exercise/get');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Get student exercise by id', () => {
        it('admin can get student exercise by id', async () => {
            const res = await request(app)
                .get(`/student-exercise/get/${testStudentExercises.studentExercise._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(testStudentExercises.studentExercise._id);
            expect(res.body.student_id).toBe(testUsers.student._id.toString());
            expect(res.body.exercise_id).toBe(testExercises.coachExercise._id.toString());
        });

        it('returns 404 for non-existent student exercise', async () => {
            const res = await request(app)
                .get('/student-exercise/get/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('StudentExercise not found');
        });

        it('coach cannot get student exercise by id', async () => {
            const res = await request(app)
                .get(`/student-exercise/get/${testStudentExercises.studentExercise._id}`)
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('student cannot get student exercise by id', async () => {
            const res = await request(app)
                .get(`/student-exercise/get/${testStudentExercises.studentExercise._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot get student exercise by id', async () => {
            const res = await request(app)
                .get(`/student-exercise/get/${testStudentExercises.studentExercise._id}`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Delete student exercise', () => {
        it('admin can delete student exercise', async () => {
            const res = await request(app)
                .delete(`/student-exercise/delete/${testStudentExercises.studentExercise._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Student exercise deleted successfully');

            // Verify it's deleted
            const checkRes = await request(app)
                .get(`/student-exercise/get/${testStudentExercises.studentExercise._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(checkRes.statusCode).toBe(404);
        });

        it('returns 404 for non-existent student exercise', async () => {
            const res = await request(app)
                .delete('/student-exercise/delete/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('StudentExercise not found');
        });

        it('coach cannot delete student exercise', async () => {
            const res = await request(app)
                .delete(`/student-exercise/delete/${testStudentExercises.adminCreated._id}`)
                .set('Authorization', `Bearer ${coachToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('student cannot delete student exercise', async () => {
            const res = await request(app)
                .delete(`/student-exercise/delete/${testStudentExercises.adminCreated._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('unauthenticated user cannot delete student exercise', async () => {
            const res = await request(app)
                .delete(`/student-exercise/delete/${testStudentExercises.adminCreated._id}`);

            expect(res.statusCode).toBe(401);
        });
    });
});
