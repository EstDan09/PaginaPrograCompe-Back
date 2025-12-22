const StudentGroupController = require("../controllers/studentGroupController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/student-group/create", coach_ops, StudentGroupController.createStudentGroup);
    app.get("/student-group/get", admin_ops, StudentGroupController.getStudentGroups);
    app.get("/student-group/get/:id", admin_ops, StudentGroupController.getStudentGroupById);
    app.put("/student-group/update/:id", admin_ops, StudentGroupController.updateStudentGroup);
    app.delete("/student-group/delete/:id", coach_ops, StudentGroupController.deleteStudentGroup);

    app.get("/student-group/get-by-student", student_ops, StudentGroupController.getStudentGroupsByStudent);
    app.get("/student-group/get-by-group/:group_id", normal_ops, StudentGroupController.getStudentGroupsByGroup);
}