// TODO: fix
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
     *     description: Creates a new study group
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
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       500:
     *         description: Server error
     */
    app.post("/group/create", coach_ops, GroupController.createGroup);

    /**
     * @openapi
     * /group/get:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get groups by filters
     *     description: Retrieves groups matching optional criteria
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
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       500:
     *         description: Server error
     */
    app.get("/group/get", coach_ops, GroupController.getGroups);

    /**
     * @openapi
     * /group/get/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group by ID
     *     description: Retrieves a specific group by ID
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
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.get("/group/get/:id", normal_ops, GroupController.getGroupById);

    /**
     * @openapi
     * /group/update/{id}:
     *   put:
     *     tags:
     *       - Groups
     *     summary: Update group
     *     description: Updates group information
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
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.put("/group/update/:id", coach_ops, GroupController.updateGroup);

    /**
     * @openapi
     * /group/delete/{id}:
     *   delete:
     *     tags:
     *       - Groups
     *     summary: Delete group
     *     description: Deletes a group and all associated data
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
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.delete("/group/delete/:id", coach_ops, GroupController.deleteGroup);

    /**
     * @openapi
     * /group/create-invite-code/{id}:
     *   post:
     *     tags:
     *       - Groups
     *     summary: Create invite code
     *     description: Generates a new invite code for group
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
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.post("/group/create-invite-code/:id", coach_ops, GroupController.createGroupInviteCode);

    /**
     * @openapi
     * /group/get-invite-code/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get invite code
     *     description: Retrieves current invite code for group
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
     *       403:
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.get("/group/get-invite-code/:id", coach_ops, GroupController.getGroupInviteCode);

    /**
     * @openapi
     * /group/delete-invite-code/{id}:
     *   delete:
     *     tags:
     *       - Groups
     *     summary: Delete invite code
     *     description: Removes invite code for group
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
     *         description: Forbidden - Coaches/admins only
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.delete("/group/delete-invite-code/:id", coach_ops, GroupController.deleteGroupInviteCode);

    /**
     * @openapi
     * /group/get-messages/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group messages
     *     description: Retrieves all messages in a group
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
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.get("/group/get-messages/:id", normal_ops, GroupController.getGroupMessages);

    /**
     * @openapi
     * /group/send-message/{id}:
     *   post:
     *     tags:
     *       - Groups
     *     summary: Send message to group
     *     description: Posts a message to group's message board
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
     *       400:
     *         description: Bad request
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.post("/group/send-message/:id", normal_ops, GroupController.sendGroupMessage);

    /**
     * @openapi
     * /group/my-groups-summary:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get my groups summary
     *     description: Retrieves summary of groups user is member of
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Groups summary
     *       500:
     *         description: Server error
     */
    app.get("/group/my-groups-summary", normal_ops, GroupController.getMyGroupsSummary);

    /**
     * @openapi
     * /group/details/{id}:
     *   get:
     *     tags:
     *       - Groups
     *     summary: Get group details
     *     description: Retrieves detailed group information
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
     *       404:
     *         description: Group not found
     *       500:
     *         description: Server error
     */
    app.get("/group/details/:id", normal_ops, GroupController.getGroupDetails);
}