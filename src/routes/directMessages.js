const DirectMessagesController = require("../controllers/directMessagesController");
const authMiddleware = require("../middlewares/authMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /direct-messages/send/{user_id}:
     *   post:
     *     tags:
     *       - Direct Messages
     *     summary: Send direct message
     *     description: Sends a direct message from the authenticated user to another user. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: user_id
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
     *         description: Message sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/DirectMessage'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Blocked
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
    app.post("/direct-messages/send/:user_id", normal_ops, DirectMessagesController.sendDirectMessage);

    /**
     * @openapi
     * /direct-messages/conversation/:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get conversation partners
     *     description: Retrieves list of user IDs that the authenticated user has conversation history with. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Array of user IDs
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
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
    app.get("/direct-messages/conversation/", normal_ops, DirectMessagesController.getConversations);

    /**
     * @openapi
     * /direct-messages/conversation/{user_id}:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get conversation messages
     *     description: Retrieves all messages in conversation with specified user. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: user_id
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
     *                 $ref: '#/components/schemas/DirectMessage'
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
    app.get("/direct-messages/conversation/:user_id", normal_ops, DirectMessagesController.getConversation);

    /**
     * @openapi
     * /direct-messages/block/{user_id}:
     *   post:
     *     tags:
     *       - Direct Messages
     *     summary: Block a user
     *     description: Adds a user to your block list. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: user_id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       201:
     *         description: User blocked
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user_id:
     *                   type: string
     *                 blocked_user_id:
     *                   type: string
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
    app.post("/direct-messages/block/:user_id", normal_ops, DirectMessagesController.blockUser);

    /**
     * @openapi
     * /direct-messages/unblock/{user_id}:
     *   delete:
     *     tags:
     *       - Direct Messages
     *     summary: Unblock a user
     *     description: Removes a user from your block list. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: user_id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User unblocked
     *       400:
     *         description: User not in block list
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
    app.delete("/direct-messages/unblock/:user_id", normal_ops, DirectMessagesController.unblockUser);

    /**
     * @openapi
     * /direct-messages/blocked:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get blocked users
     *     description: Retrieves list of all blocked user IDs. Authentication Basic
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Array of blocked user IDs
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
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
    app.get("/direct-messages/blocked", normal_ops, DirectMessagesController.getBlockedUsers);
};