const GroupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create group
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: {name: string, description: string, parent_coach(IFF admin): string}
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string }
     */
    app.post("/group/create", coach_ops, GroupController.createGroup);

    /**
     * Get groups by filters
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlQuery Input: name? [string], description? [string], parent_coach? [string]
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string, group_messages: message[], invite_code: string? }[]
     */
    app.get("/group/get", coach_ops, GroupController.getGroups);

    /**
     * Get group by id
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string, group_messages: message[], invite_code: string? }
     */
    app.get("/group/get/:id", normal_ops, GroupController.getGroupById);

    /**
     * Update group
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: {name?: string, description?: string}
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string, group_messages: message[], invite_code: string? }
     */
    app.put("/group/update/:id", coach_ops, GroupController.updateGroup);

    /**
     * Delete group
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/group/delete/:id", coach_ops, GroupController.deleteGroup);

    /**
     * Create group invite code
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { invite_code: string }
     */
    app.post("/group/create-invite-code/:id", coach_ops, GroupController.createGroupInviteCode);

    /**
     * Get group invite code
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { invite_code: string }
     */
    app.get("/group/get-invite-code/:id", coach_ops, GroupController.getGroupInviteCode);

    /**
     * Delete group invite code
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { message: string }
     */
    app.delete("/group/delete-invite-code/:id", coach_ops, GroupController.deleteGroupInviteCode);

    /**
     * Get group messages
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { sender_id: string, message: string, timestamp: Date }[]
     */
    app.get("/group/get-messages/:id", normal_ops, GroupController.getGroupMessages);

    /**
     * Send group message
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * Body Input: { message: string }
     * 
     * Body Output: { sender_id: string, message: string, timestamp: Date }
     */
    app.post("/group/send-message/:id", normal_ops, GroupController.sendGroupMessage);

    app.get("/group/my-groups-summary", normal_ops, GroupController.getMyGroupsSummary);
}