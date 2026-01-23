const StudentGroupController = require("../controllers/studentGroupController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create student group link
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: { group_id: string, student_id: string }
     * 
     * Body Output: { _id: string, group_id: string, student_id: string }
     */
    app.post("/student-group/create", coach_ops, StudentGroupController.createStudentGroup);

    /**
     * Get student group links by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: group_id? [string], student_id? [string]
     * 
     * Body Output: { _id: string, group_id: string, student_id: string }[]
     */
    app.get("/student-group/get", normal_ops, StudentGroupController.getStudentGroups);

    /**
     * Get student group links by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, group_id: string, student_id: string }
     */
    app.get("/student-group/get/:id", admin_ops, StudentGroupController.getStudentGroupById);

    /**
     * Delete student group link
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/student-group/delete/:id", coach_ops, StudentGroupController.deleteStudentGroup);

    /**
     * Use group invite code
     * 
     * Previous authentication: Student
     * 
     * Body Input: { invite_code: string }
     * 
     * Body Output: { message: string }
     */
    app.post("/student-group/use-invite-code", fstudent_ops, StudentGroupController.useGroupInviteCode);
}