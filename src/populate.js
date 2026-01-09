const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db.js");
const User = require("./models/User.js");
const mongoose = require("mongoose");
const request = require("supertest");

dotenv.config();

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        username: 'admin',
        password_hash: process.env.ADMIN_PASSWORD,
        email: 'MoyaBabushkaKuritTrubku',
        role: 'admin'
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const createAndLoginUser = async ({ username, password, role, email }) => {
    const user = await User.create({ username, password_hash: password, email: email || `${username}@test.com`, role });
    const res = await request(app)
        .post('/auth/login')
        .send({ username, password });
    return { user, token: res.body.token };
};

const populateDatabase = async() => {
    try {
        const adminRes = await request(app)
            .post('/auth/login')
            .send({ username: 'admin', password: process.env.ADMIN_PASSWORD });
        if (adminRes.status !== 200) {
            throw new Error('Failed to login admin: ' + adminRes.text);
        }
        const adminToken = adminRes.body.token;
        const admin = await User.findOne({ username: 'admin' });

        ({ user: student, token: studentToken } = await createAndLoginUser({
            username: "student",
            password: "studentpass",
            role: "student"
        }));

        ({ user: coach, token: coachToken } = await createAndLoginUser({
            username: "coach",
            password: "coachpass",
            role: "coach"
        }));

        for (let i = 1; i <= 2; i++) {
            const res = await request(app)
                .post('/admin/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ username: `student${i}`, password: 'pass', email: `student${i}@test.com`, role: 'student' });
            if (res.status !== 201) {
                throw new Error('Failed to create user: ' + res.text);
            }
        }

        const groups = [];
        for (let i = 1; i <= 5; i++) {
            const res = await request(app)
                .post('/group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ name: `Group ${i}`, description: `Description for group ${i}` });
            if (res.status !== 201) {
                throw new Error('Failed to create group: ' + res.text);
            }
            groups.push(res.body);
        }

        const assignments = [];
        for (let i = 0; i < 5; i++) {
            const res = await request(app)
                .post('/assignment/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({
                    title: `Assignment ${i + 1}`,
                    description: `Description for assignment ${i + 1}`,
                    due_date: new Date(Date.now() + (i + 1) * 86400000),
                    parent_group: groups[i]._id
                });
            if (res.status !== 201) {
                throw new Error('Failed to create assignment: ' + res.text);
            }
            assignments.push(res.body);
        }

        const exercises = [];
        for (let i = 0; i < 5; i++) {
            const res = await request(app)
                .post('/exercise/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({
                    name: `Exercise ${i + 1}`,
                    cf_code: `123${i}A`,
                    parent_assignment: assignments[i]._id
                });
            if (res.status !== 201) {
                throw new Error('Failed to create exercise: ' + res.text);
            }
            exercises.push(res.body);
        }

        for (let group of groups) {
            const res = await request(app)
                .post('/student-group/create')
                .set('Authorization', `Bearer ${coachToken}`)
                .send({ group_id: group._id, student_id: student._id });
            if (res.status !== 201) {
                throw new Error('Failed to create student-group: ' + res.text);
            }
        }

        for (let exercise of exercises) {
            const res = await request(app)
                .post('/student-exercise/create')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ exercise_id: exercise._id });
            if (res.status !== 201) {
                throw new Error('Failed to create student-exercise: ' + res.text);
            }
        }

        console.log('Database populated successfully');
    } catch (error) {
        console.error('Error populating database:', error);
        throw error;
    }
};

const port = process.env.PORT || 3000;

connectDB().then(async () => {
  await mongoose.connection.dropDatabase();
  await seedDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  await populateDatabase();
  process.exit(0);
}).catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});
