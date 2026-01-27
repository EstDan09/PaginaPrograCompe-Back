const DirectMessagesController = require("../controllers/directMessagesController");
const authMiddleware = require("../middlewares/authMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Send a direct message to a user
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :user_id [string]
     * Body Input: { message: string }
     * 
     * Body Output: { _id: string, sender_id: string, receiver_id: string, message: string, createdAt: string, updatedAt: string }
     */
    app.post("/direct-messages/send/:user_id", normal_ops, DirectMessagesController.sendDirectMessage);

    /**
     * Get conversation partners
     * 
     * Previous authentication: Basic
     * 
     * Body Output: string[]
     */
    app.get("/direct-messages/conversation/", normal_ops, DirectMessagesController.getConversations);

    /**
     * Get conversation with a specific user
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :user_id [string]
     * 
     * Body Output: { _id: string, sender_id: string, receiver_id: string, message: string, createdAt: string, updatedAt: string }[]
     */
    app.get("/direct-messages/conversation/:user_id", normal_ops, DirectMessagesController.getConversation);

    /**
     * Block a user
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :user_id [string]
     * 
     * Body Output: { _id: string, user_id: string, blocked_user_id: string, createdAt: string, updatedAt: string }
     */
    app.post("/direct-messages/block/:user_id", normal_ops, DirectMessagesController.blockUser);

    /**
     * Unblock a user
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :user_id [string]
     * 
     * Body Output: { message: string }
     */
    app.delete("/direct-messages/unblock/:user_id", normal_ops, DirectMessagesController.unblockUser);

    /**
     * Get blocked users
     * 
     * Previous authentication: Basic
     * 
     * Body Output: string[]
     */
    app.get("/direct-messages/blocked", normal_ops, DirectMessagesController.getBlockedUsers);
};