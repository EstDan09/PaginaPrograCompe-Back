const StudentGroupController = require("../controllers/studentGroupController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /student-group/create:
     *   post:
     *     tags:
     *       - Student Groups
     *     summary: Create student-group membership
     *     description: Adds a student to a group. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [group_id, student_id]
     *             properties:
     *               group_id:
     *                 type: string
     *               student_id:
     *                 type: string
     *     responses:
     *       201:
     *         description: Membership created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentGroup'
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
    app.post("/student-group/create", coach_ops, StudentGroupController.createStudentGroup);

    /**
     * @openapi
     * /student-group/add-member:
     *   post:
     *     tags:
     *       - Student Groups
     *     summary: Create student-group membership by username
     *     description: Adds a student to a group. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [group_id, student_username]
     *             properties:
     *               group_id:
     *                 type: string
     *               student_username:
     *                 type: string
     *     responses:
     *       201:
     *         description: Membership created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentGroup'
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
    app.post("/student-group/add-member", coach_ops, StudentGroupController.addMemberGroup);

    /**
     * @openapi
     * /student-group/get:
     *   get:
     *     tags:
     *       - Student Groups
     *     summary: Get student-group links
     *     description: Retrieves membership links matching filters. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: group_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: student_id
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of membership links
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/StudentGroup'
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
    app.get("/student-group/get", normal_ops, StudentGroupController.getStudentGroups);

    /**
     * @openapi
     * /student-group/get/{id}:
     *   get:
     *     tags:
     *       - Student Groups
     *     summary: Get student-group link by ID
     *     description: Retrieves a specific membership link. Authentication Admin
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
     *               $ref: '#/components/schemas/StudentGroup'
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
    app.get("/student-group/get/:id", admin_ops, StudentGroupController.getStudentGroupById);

    /**
     * @openapi
     * /student-group/delete/{id}:
     *   delete:
     *     tags:
     *       - Student Groups
     *     summary: Delete student from group
     *     description: Removes a student from a group. Authentication Admin/Coach
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
     *         description: Membership deleted
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
    app.delete("/student-group/delete/:id", coach_ops, StudentGroupController.deleteStudentGroup);

    /**
     * @openapi
     * /student-group/use-invite-code:
     *   post:
     *     tags:
     *       - Student Groups
     *     summary: Join group using invite code
     *     description: Allows a student to join a group using an invite code. Authentication Student
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [invite_code]
     *             properties:
     *               invite_code:
     *                 type: string
     *     responses:
     *       201:
     *         description: Successfully joined group
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StudentGroup'
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
     *       404:
     *         description: Group not found
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
    app.post("/student-group/use-invite-code", fstudent_ops, StudentGroupController.useGroupInviteCode);

    /**
     * @openapi
     * /student-group/get-with-username:
     *   get:
     *     tags:
     *       - Student Groups
     *     summary: Get student-group links with student usernames
     *     description: Retrieves membership links matching filters with student usernames. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: group_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: student_id
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of membership links
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/StudentGroupUsername'
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
    app.get("/student-group/get-with-username", normal_ops, StudentGroupController.getStudentGroupsWithUsername);
}