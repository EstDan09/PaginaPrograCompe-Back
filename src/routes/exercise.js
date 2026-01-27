const ExerciseController = require("../controllers/exerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /exercise/create:
     *   post:
     *     tags:
     *       - Exercises
     *     summary: Create exercise
     *     description: Creates a new exercise within an assignment. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - cf_code
     *               - parent_assignment
     *             properties:
     *               name:
     *                 type: string
     *                 description: Exercise name (required, non-empty)
     *               cf_code:
     *                 type: string
     *                 description: CodeForces problem code (required, format contestId+problemLetter)
     *               parent_assignment:
     *                 type: string
     *                 description: Assignment ID (required, must be valid MongoDB ObjectId)
     *     responses:
     *       '201':
     *         description: Exercise created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Exercise'
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/exercise/create", coach_ops, ExerciseController.createExercise);

    /**
     * @openapi
     * /exercise/get:
     *   get:
     *     tags:
     *       - Exercises
     *     summary: Get exercises by filters
     *     description: Retrieves exercises matching optional filter criteria. All filters are optional. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filter by exercise name (partial match)
     *       - in: query
     *         name: cf_code
     *         schema:
     *           type: string
     *         description: Filter by CodeForces problem code
     *       - in: query
     *         name: parent_assignment
     *         schema:
     *           type: string
     *         description: Filter by parent assignment ID
     *     responses:
     *       '200':
     *         description: Array of matching exercises
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Exercise'
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/exercise/get", normal_ops, ExerciseController.getExercises);

    /**
     * @openapi
     * /exercise/get/{id}:
     *   get:
     *     tags:
     *       - Exercises
     *     summary: Get exercise by ID
     *     description: Retrieves a specific exercise by its ID. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Exercise ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Exercise found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Exercise'
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '404':
     *         description: Exercise not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/exercise/get/:id", normal_ops, ExerciseController.getExerciseById);

    /**
     * @openapi
     * /exercise/update/{id}:
     *   put:
     *     tags:
     *       - Exercises
     *     summary: Update exercise
     *     description: Updates an existing exercise. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Exercise ID (must be valid MongoDB ObjectId)
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: New exercise name
     *     responses:
     *       '200':
     *         description: Exercise updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Exercise'
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '404':
     *         description: Exercise not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.put("/exercise/update/:id", coach_ops, ExerciseController.updateExercise);

    /**
     * @openapi
     * /exercise/delete/{id}:
     *   delete:
     *     tags:
     *       - Exercises
     *     summary: Delete exercise
     *     description: Deletes an exercise. Associated student-exercise links may also be deleted. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Exercise ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Exercise deleted successfully
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '404':
     *         description: Exercise not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.delete("/exercise/delete/:id", coach_ops, ExerciseController.deleteExercise);
}