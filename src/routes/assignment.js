const AssignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/assignment/create", coach_ops, AssignmentController.createAssignment);
    app.get("/assignment/get", coach_ops, AssignmentController.getAssignments);
    app.get("/assignment/get/:id", normal_ops, AssignmentController.getAssignmentById);
    app.put("/assignment/update/:id", coach_ops, AssignmentController.updateAssignment);
    app.delete("/assignment/delete/:id", coach_ops, AssignmentController.deleteAssignment);

    app.get("/assignment/get-by-group/:parent_group", normal_ops, AssignmentController.getAssignmentsByGroup);
}