const StudentExerciseController = require("../controllers/studentExerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /student-exercise/create:
     *   post:
     *     tags:
     *       - Student Exercises
     *     summary: Create student-exercise link
     *     description: Creates a link between authenticated student and an exercise. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [exercise_id]
     *             properties:
     *               exercise_id:
     *                 type: string
     *     responses:
     *       201:
     *         description: Link created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentExercise'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/student-exercise/create", fstudent_ops, StudentExerciseController.createStudentExercise);

    /**
     * @openapi
     * /student-exercise/create/{student_id}:
     *   post:
     *     tags:
     *       - Student Exercises
     *     summary: Create student-exercise link (admin)
     *     description: Creates a link for specific student. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: student_id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [exercise_id]
     *             properties:
     *               exercise_id:
     *                 type: string
     *     responses:
     *       201:
     *         description: Link created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentExercise'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/student-exercise/create/:student_id", admin_ops, StudentExerciseController.createStudentExercise);

    /**
     * @openapi
     * /student-exercise/get:
     *   get:
     *     tags:
     *       - Student Exercises
     *     summary: Get student-exercise links
     *     description: Retrieves links matching filter criteria. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: student_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: exercise_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: assignment_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: group_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: completion_type
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of student-exercise links
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/StudentExercise'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/student-exercise/get", normal_ops, StudentExerciseController.getStudentExercises);

    /**
     * @openapi
     * /student-exercise/get/{id}:
     *   get:
     *     tags:
     *       - Student Exercises
     *     summary: Get student-exercise link by ID
     *     description: Retrieves a specific link. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Link found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentExercise'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Link not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/student-exercise/get/:id", admin_ops, StudentExerciseController.getStudentExerciseById);

    /**
     * @openapi
     * /student-exercise/delete/{id}:
     *   delete:
     *     tags:
     *       - Student Exercises
     *     summary: Delete student-exercise link
     *     description: Removes link between student and exercise. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Link deleted
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Link not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.delete("/student-exercise/delete/:id", admin_ops, StudentExerciseController.deleteStudentExercise);
}