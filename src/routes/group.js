const GroupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /group/create:
     *   post:
     *     tags:
     *       - Groups
     *     summary: Create group
     *     description: Creates a new study group. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [name, description]
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               parent_coach:
     *                 type: string
     *     responses:
     *       201:
     *         description: Group created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Group'
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
    app.post("/group/create", coach_ops, GroupController.createGroup);

    /**
     * @openapi
     * /group/get:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get groups by filters
     *     description: Retrieves groups matching optional criteria. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: description
     *         schema:
     *           type: string
     *       - in: query
     *         name: parent_coach
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Array of groups
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Group'
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
    app.get("/group/get", coach_ops, GroupController.getGroups);

    /**
     * @openapi
     * /group/get/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group by ID
     *     description: Retrieves a specific group by ID. Authentication Basic
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
     *         description: Group found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Group'
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
    app.get("/group/get/:id", normal_ops, GroupController.getGroupById);

    /**
     * @openapi
     * /group/update/{id}:
     *   put:
     *     tags:
     *       - Groups
     *     summary: Update group
     *     description: Updates group information. Authentication Admin/Coach
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
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       200:
     *         description: Group updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Group'
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
    app.put("/group/update/:id", coach_ops, GroupController.updateGroup);

    /**
     * @openapi
     * /group/delete/{id}:
     *   delete:
     *     tags:
     *       - Groups
     *     summary: Delete group
     *     description: Deletes a group and all associated data. Authentication Admin/Coach
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
     *         description: Group deleted
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
    app.delete("/group/delete/:id", coach_ops, GroupController.deleteGroup);

    /**
     * @openapi
     * /group/create-invite-code/{id}:
     *   post:
     *     tags:
     *       - Groups
     *     summary: Create invite code
     *     description: Generates a new invite code for group. Authentication Admin/Coach
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       201:
     *         description: Invite code created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 invite_code:
     *                   type: string
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
    app.post("/group/create-invite-code/:id", coach_ops, GroupController.createGroupInviteCode);

    /**
     * @openapi
     * /group/get-invite-code/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get invite code
     *     description: Retrieves current invite code for group. Authentication Admin/Coach
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
     *         description: Invite code found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 invite_code:
     *                   type: string
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
    app.get("/group/get-invite-code/:id", coach_ops, GroupController.getGroupInviteCode);

    /**
     * @openapi
     * /group/delete-invite-code/{id}:
     *   delete:
     *     tags:
     *       - Groups
     *     summary: Delete invite code
     *     description: Removes invite code for group. Authentication Admin/Coach
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
     *         description: Invite code deleted
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
    app.delete("/group/delete-invite-code/:id", coach_ops, GroupController.deleteGroupInviteCode);

    /**
     * @openapi
     * /group/get-messages/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group messages
     *     description: Retrieves all messages in a group. Authentication Basic
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
     *         description: Array of messages
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GroupMessage'
     *       404:
     *         description: Group not found
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
    app.get("/group/get-messages/:id", normal_ops, GroupController.getGroupMessages);

    /**
     * @openapi
     * /group/send-message/{id}:
     *   post:
     *     tags:
     *       - Groups
     *     summary: Send message to group
     *     description: Posts a message to group's message board. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: id
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
     *             required: [message]
     *             properties:
     *               message:
     *                 type: string
     *     responses:
     *       201:
     *         description: Message posted
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GroupMessage'
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
    app.post("/group/send-message/:id", normal_ops, GroupController.sendGroupMessage);

    /**
     * @openapi
     * /group/my-groups-summary:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get my groups summary
     *     description: Retrieves summary of groups user is member of. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Groups summary
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   groupId:
     *                     type: string
     *                     description: Unique identifier for the group
     *                   name:
     *                     type: string
     *                     description: Name of the group
     *                   ownerUsername:
     *                     type: string
     *                     description: Username of the group owner
     *                   members:
     *                     type: integer
     *                     description: Number of members in the group
     *                   dueAssignments:
     *                     type: integer
     *                     description: Number of due assignments in the group
     *                   role:
     *                     type: string
     *                     enum: [member, owner]
     *                     description: Role of the user in the group
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
    app.get("/group/my-groups-summary", normal_ops, GroupController.getMyGroupsSummary);

    /**
     * @openapi
     * /group/details/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group details
     *     description: Retrieves detailed group information. Authentication Basic
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
     *         description: Group details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 group:
     *                   type: object
     *                   description: Group information
     *                   properties:
     *                     _id:
     *                       type: string
     *                       description: Unique identifier for the group
     *                     name:
     *                       type: string
     *                       description: Name of the group
     *                     description:
     *                       type: string
     *                       description: Description of the group
     *                     owner:
     *                       type: object
     *                       description: Owner of the group
     *                       properties:
     *                         _id:
     *                           type: string
     *                           description: Unique identifier for the owner
     *                         username:
     *                           type: string
     *                           description: Username of the owner
     *                 assignments:
     *                   type: array
     *                   description: Assignments associated with the group
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         description: Unique identifier for the assignment
     *                       title:
     *                         type: string
     *                         description: Title of the assignment
     *                       description:
     *                         type: string
     *                         description: Description of the assignment
     *                       due_date:
     *                         type: string
     *                         format: date-time
     *                         description: Due date of the assignment
     *                       exerciseCount:
     *                         type: integer
     *                         description: Number of exercises in the assignment
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
    app.get("/group/details/:id", normal_ops, GroupController.getGroupDetails);
}