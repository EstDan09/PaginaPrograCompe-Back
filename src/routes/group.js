const GroupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
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
     * UrlQuery Input: id? [string], name? [string], description? [string], parent_coach? [string]
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string }[]
     */
    app.get("/group/get", coach_ops, GroupController.getGroups);

    /**
     * Get group by id
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, name: string, description: string, parent_coach: string }
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
     * Body Output: { _id: string, name: string, description: string, parent_coach: string }
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
}