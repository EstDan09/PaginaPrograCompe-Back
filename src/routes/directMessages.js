// TODO: fix
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
     *     description: Sends a direct message from the authenticated user to another user
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
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.post("/direct-messages/send/:user_id", normal_ops, DirectMessagesController.sendDirectMessage);

    /**
     * @openapi
     * /direct-messages/conversation/:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get conversation partners
     *     description: Retrieves list of user IDs that the authenticated user has conversation history with
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Array of user IDs
     *       500:
     *         description: Server error
     */
    app.get("/direct-messages/conversation/", normal_ops, DirectMessagesController.getConversations);

    /**
     * @openapi
     * /direct-messages/conversation/{user_id}:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get conversation messages
     *     description: Retrieves all messages in conversation with specified user
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
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.get("/direct-messages/conversation/:user_id", normal_ops, DirectMessagesController.getConversation);

    /**
     * @openapi
     * /direct-messages/block/{user_id}:
     *   post:
     *     tags:
     *       - Direct Messages
     *     summary: Block a user
     *     description: Adds a user to your block list
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
     *       400:
     *         description: Bad request
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    app.post("/direct-messages/block/:user_id", normal_ops, DirectMessagesController.blockUser);

    /**
     * @openapi
     * /direct-messages/unblock/{user_id}:
     *   delete:
     *     tags:
     *       - Direct Messages
     *     summary: Unblock a user
     *     description: Removes a user from your block list
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
     *       404:
     *         description: User not in block list
     *       500:
     *         description: Server error
     */
    app.delete("/direct-messages/unblock/:user_id", normal_ops, DirectMessagesController.unblockUser);

    /**
     * @openapi
     * /direct-messages/blocked:
     *   get:
     *     tags:
     *       - Direct Messages
     *     summary: Get blocked users
     *     description: Retrieves list of all blocked user IDs
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Array of blocked user IDs
     *       500:
     *         description: Server error
     */
    app.get("/direct-messages/blocked", normal_ops, DirectMessagesController.getBlockedUsers);
};