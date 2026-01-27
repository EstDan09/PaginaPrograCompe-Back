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
     *     description: Adds a student to a group (coaches/admins only)
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
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group or student not found
     *       500:
     *         description: Server error
     */
    app.post("/student-group/create", coach_ops, StudentGroupController.createStudentGroup);

    /**
     * @openapi
     * /student-group/get:
     *   get:
     *     tags:
     *       - Student Groups
     *     summary: Get student-group links
     *     description: Retrieves membership links matching filters
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
     *       500:
     *         description: Server error
     */
    app.get("/student-group/get", normal_ops, StudentGroupController.getStudentGroups);

    /**
     * @openapi
     * /student-group/get/{id}:
     *   get:
     *     tags:
     *       - Student Groups
     *     summary: Get student-group link by ID
     *     description: Retrieves a specific membership link (admin only)
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
     *       403:
     *         description: Forbidden - Admins only
     *       404:
     *         description: Link not found
     *       500:
     *         description: Server error
     */
    app.get("/student-group/get/:id", admin_ops, StudentGroupController.getStudentGroupById);

    /**
     * @openapi
     * /student-group/delete/{id}:
     *   delete:
     *     tags:
     *       - Student Groups
     *     summary: Delete student from group
     *     description: Removes a student from a group
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
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Link not found
     *       500:
     *         description: Server error
     */
    app.delete("/student-group/delete/:id", coach_ops, StudentGroupController.deleteStudentGroup);

    /**
     * @openapi
     * /student-group/use-invite-code:
     *   post:
     *     tags:
     *       - Student Groups
     *     summary: Join group using invite code
     *     description: Allows a student to join a group using an invite code
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
     *       200:
     *         description: Successfully joined group
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden - Students only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.post("/student-group/use-invite-code", fstudent_ops, StudentGroupController.useGroupInviteCode);
}