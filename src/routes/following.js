const FollowingController = require("../controllers/followingController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /following/create:
     *   post:
     *     tags:
     *       - Following
     *     summary: Create following relationship between two students
     *     description: Creates a following relationship where student_1 follows student_2. Admins can create followings for any student, but students can only create followings for themselves. Users cannot follow themselves. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - student_2_id
     *             properties:
     *               student_2_id:
     *                 type: string
     *                 description: ID of the student to follow (must be valid MongoDB ObjectId, must be different from student_1_id)
     *               student_1_id:
     *                 type: string
     *                 description: ID of the student who follows (optional for students, defaults to authenticated user; required for admins)
     *     responses:
     *       '201':
     *         description: Following created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Following'
     *       '400':
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post("/following/create", student_ops, FollowingController.createFollowing);

    /**
     * @openapi
     * /following/get:
     *   get:
     *     tags:
     *       - Following
     *     summary: Get followings by student IDs
     *     description: Retrieves following relationships filtered by student IDs. Students can only view their own followings (as student_1_id). Admins can view all followings with any filter combination. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: student_1_id
     *         schema:
     *           type: string
     *         description: Filter by follower ID
     *       - in: query
     *         name: student_2_id
     *         schema:
     *           type: string
     *         description: Filter by followed user ID
     *     responses:
     *       '200':
     *         description: Array of following relationships
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Following'
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
    app.get("/following/get", student_ops, FollowingController.getFollowing);

    /**
     * @openapi
     * /following/get/{id}:
     *   get:
     *     tags:
     *       - Following
     *     summary: Get following relationship by ID
     *     description: Retrieves a specific following relationship by its ID. Authentication Admin
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Following relationship ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Following relationship found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Following'
     *       '404':
     *         description: Following not found
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/following/get/:id", admin_ops, FollowingController.getFollowingById);

    /**
     * @openapi
     * /following/delete/{id}:
     *   delete:
     *     tags:
     *       - Following
     *     summary: Delete following relationship
     *     description: Removes a following relationship. Students can only delete their own followings. Admins can delete any following. Authentication Admin/Student
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Following relationship ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Following deleted successfully
     *       '403':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '404':
     *         description: Following not found
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.delete("/following/delete/:id", student_ops, FollowingController.deleteFollowing);

    /**
     * @openapi
     * /following/count/{user_id}:
     *   get:
     *     tags:
     *       - Following
     *     summary: Get follower count for a student
     *     description: Counts how many users are following the specified student (user_id). Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *         description: Target student's ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Follower count retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 count:
     *                   type: number
     *                   description: Number of followers
     *       '400':
     *         description: Invalid user_id format
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
     *       '500':
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/following/count/:user_id", normal_ops, FollowingController.countFollowers);

    /**
     * @openapi
     * /following:
     *   get:
     *     tags:
     *       - Following
     *     summary: List students followed by authenticated user
     *     description: Returns a list of usernames and ids that the authenticated student is following. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *         description: List of followings
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 following:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         description: Id of following entry
     *                       name:
     *                         type: string
     *                         description: Username of followed student
     *                       student_id:
     *                         type: string
     *                         description: Id of followed student
     *       403:
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
    app.get("/following", fstudent_ops, FollowingController.listFollowings);
}