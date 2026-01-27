const DirectMessagesController = require("../controllers/directMessagesController");
const authMiddleware = require("../middlewares/authMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/direct-messages/send/:user_id", normal_ops, DirectMessagesController.sendDirectMessage);
    app.get("/direct-messages/conversation/", normal_ops, DirectMessagesController.getConversations);
    app.get("/direct-messages/conversation/:user_id", normal_ops, DirectMessagesController.getConversation);
    app.post("/direct-messages/block/:user_id", normal_ops, DirectMessagesController.blockUser);
    app.delete("/direct-messages/unblock/:user_id", normal_ops, DirectMessagesController.unblockUser);
    app.get("/direct-messages/blocked", normal_ops, DirectMessagesController.getBlockedUsers);
};