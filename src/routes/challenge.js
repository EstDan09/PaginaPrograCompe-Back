const ChallengeController = require("../controllers/challengeController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /challenge/create:
     *   post:
     *     tags:
     *       - Challenges
     *     summary: Create challenge
     *     description: Creates a new challenge for the authenticated student. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [cf_code]
     *             properties:
     *               cf_code:
     *                 type: string
     *                 description: CodeForces problem code (e.g., "1234A")
     *     responses:
     *       201:
     *         description: Challenge created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Challenge'
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
    app.post("/challenge/create", fstudent_ops, ChallengeController.createChallenge);

    /**
     * @openapi
     * /challenge/create/{student_id}:
     *   post:
     *     tags:
     *       - Challenges
     *     summary: Create challenge for student (admin)
     *     description: Creates a new challenge for a specific student. Authentication Admin
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
     *             required: [cf_code]
     *             properties:
     *               cf_code:
     *                 type: string
     *     responses:
     *       201:
     *         description: Challenge created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Challenge'
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
    app.post("/challenge/create/:student_id", admin_ops, ChallengeController.createChallenge);

    /**
     * @openapi
     * /challenge/get:
     *   get:
     *     tags:
     *       - Challenges
     *     summary: Get challenges with filters
     *     description: Retrieves challenges matching optional criteria. Students see only their own. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: student_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: cf_code
     *         schema:
     *           type: string
     *       - in: query
     *         name: is_completed_flag
     *         schema:
     *           type: string
     *       - in: query
     *         name: completion_type
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of challenges
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Challenge'
     *       403:
     *         description: Forbidden
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
    app.get("/challenge/get", student_ops, ChallengeController.getChallenges);

    /**
     * @openapi
     * /challenge/get/{id}:
     *   get:
     *     tags:
     *       - Challenges
     *     summary: Get challenge by ID
     *     description: Retrieves a specific challenge by ID. Authentication Admin
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
     *         description: Challenge found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Challenge'
     *       404:
     *         description: Challenge not found
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
    app.get("/challenge/get/:id", admin_ops, ChallengeController.getChallengeById);

    /**
     * @openapi
     * /challenge/delete/{id}:
     *   delete:
     *     tags:
     *       - Challenges
     *     summary: Delete challenge
     *     description: Deletes a challenge. Students can only delete their own. Authentication Admin/Student
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
     *         description: Challenge deleted
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Challenge not found
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
    app.delete("/challenge/delete/:id", student_ops, ChallengeController.deleteChallenge);

    /**
     * @openapi
     * /challenge/verify/{id}:
     *   put:
     *     tags:
     *       - Challenges
     *     summary: Verify challenge completion
     *     description: Marks a challenge as completed. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               completion_type:
     *                 type: string
     *     responses:
     *       200:
     *         description: Challenge verified
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Challenge'
     *       400:
     *         description: Verification failed
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
     *       404:
     *         description: Challenge not found
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
    app.put("/challenge/verify/:id", student_ops, ChallengeController.verifyChallenge);

    /**
     * @openapi
     * /challenge/ask:
     *   get:
     *     tags:
     *       - Challenges
     *     summary: Get random challenge problem
     *     description: Returns a random CodeForces problem matching criteria. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: min_rating
     *         schema:
     *           type: number
     *       - in: query
     *         name: max_rating
     *         schema:
     *           type: number
     *       - in: query
     *         name: tags
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Challenge problem found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 cf_code:
     *                  type: string
     *                 name:
     *                   type: string
     *                 rating:
     *                   type: number
     *                 contestId:
     *                   type: number
     *                 tags:
     *                   type: array
     *                   items:
     *                     type: string
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
    app.get("/challenge/ask", fstudent_ops, ChallengeController.askChallenge);
}