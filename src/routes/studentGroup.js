const StudentGroupController = require("../controllers/studentGroupController");
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
     * Get strung group links by id
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
}