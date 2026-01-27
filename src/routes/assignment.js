const AssignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /assignment/create:
     *   post:
     *     tags:
     *       - Assignments
     *     summary: Create assignment
     *     description: Creates a new assignment within a group. Only coaches/admins can create assignments.
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - parent_group
     *             properties:
     *               title:
     *                 type: string
     *                 description: Assignment title (required, non-empty)
     *               description:
     *                 type: string
     *                 description: Assignment description (required, non-empty)
     *               parent_group:
     *                 type: string
     *                 description: ID of the parent group (required, must be valid MongoDB ObjectId)
     *               due_date:
     *                 type: string
     *                 format: date-time
     *                 description: Optional due date for the assignment
     *     responses:
     *       '201':
     *         description: Assignment created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                 title:
     *                   type: string
     *                 description:
     *                   type: string
     *                 due_date:
     *                   type: string
     *                   format: date-time
     *                 parent_group:
     *                   type: string
     *       '400':
     *         description: Bad request - Invalid group ID or missing required fields
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '403':
     *         description: Forbidden - Only coaches/admins can create assignments
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
    app.post("/assignment/create", coach_ops, AssignmentController.createAssignment);

    /**
     * @openapi
     * /assignment/get:
     *   get:
     *     tags:
     *       - Assignments
     *     summary: Get assignments by filters
     *     description: Retrieves assignments matching optional filter criteria. All filters are optional and can be combined.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: title
     *         schema:
     *           type: string
     *         description: Filter by assignment title (partial match)
     *       - in: query
     *         name: description
     *         schema:
     *           type: string
     *         description: Filter by description (partial match)
     *       - in: query
     *         name: parent_group
     *         schema:
     *           type: string
     *         description: Filter by parent group ID
     *       - in: query
     *         name: due_date
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter by due date
     *     responses:
     *       '200':
     *         description: Array of matching assignments
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   _id:
     *                     type: string
     *                   title:
     *                     type: string
     *                   description:
     *                     type: string
     *                   due_date:
     *                     type: string
     *                     format: date-time
     *                   parent_group:
     *                     type: string
     *       '400':
     *         description: Invalid query parameters
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
    app.get("/assignment/get", normal_ops, AssignmentController.getAssignments);

    /**
     * @openapi
     * /assignment/get/{id}:
     *   get:
     *     tags:
     *       - Assignments
     *     summary: Get assignment by ID
     *     description: Retrieves a specific assignment by its ID.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Assignment ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Assignment found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                 title:
     *                   type: string
     *                 description:
     *                   type: string
     *                 due_date:
     *                   type: string
     *                   format: date-time
     *                 parent_group:
     *                   type: string
     *       '404':
     *         description: Assignment not found
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
    app.get("/assignment/get/:id", normal_ops, AssignmentController.getAssignmentById);

    /**
     * @openapi
     * /assignment/update/{id}:
     *   put:
     *     tags:
     *       - Assignments
     *     summary: Update assignment
     *     description: Updates an existing assignment. Only coaches/admins can update assignments.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Assignment ID (must be valid MongoDB ObjectId)
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: New assignment title
     *               description:
     *                 type: string
     *                 description: New description
     *               due_date:
     *                 type: string
     *                 format: date-time
     *                 description: New due date
     *     responses:
     *       '200':
     *         description: Assignment updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                 title:
     *                   type: string
     *                 description:
     *                   type: string
     *                 due_date:
     *                   type: string
     *                   format: date-time
     *                 parent_group:
     *                   type: string
     *       '404':
     *         description: Assignment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '403':
     *         description: Forbidden - Only coaches/admins can update
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
    app.put("/assignment/update/:id", coach_ops, AssignmentController.updateAssignment);

    /**
     * @openapi
     * /assignment/delete/{id}:
     *   delete:
     *     tags:
     *       - Assignments
     *     summary: Delete assignment
     *     description: Deletes an assignment and all associated student exercises. Only coaches/admins can delete.
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Assignment ID (must be valid MongoDB ObjectId)
     *     responses:
     *       '200':
     *         description: Assignment deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       '404':
     *         description: Assignment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       '403':
     *         description: Forbidden - Only coaches/admins can delete
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
    app.delete("/assignment/delete/:id", coach_ops, AssignmentController.deleteAssignment);

}