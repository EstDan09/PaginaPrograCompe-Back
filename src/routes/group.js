const GroupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/group/create", coach_ops, GroupController.createGroup);
    app.get("/group/get", coach_ops, GroupController.getGroups);
    app.get("/group/get/:id", normal_ops, GroupController.getGroupById);
    app.put("/group/update/:id", coach_ops, GroupController.updateGroup);
    app.delete("/group/delete/:id", coach_ops, GroupController.deleteGroup);
}