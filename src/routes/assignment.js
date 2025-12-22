const AssignmentController = require("../controllers/assignmentController");
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
     * Create assignment
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: { title: string, description: string, due_date?: Date, parent_group: string }
     * 
     * Body Output: { _id: string, title: string, description: string, due_date?: Date, parent_group: string }
     */
    app.post("/assignment/create", coach_ops, AssignmentController.createAssignment);

    /**
     * Get assignments by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: title? [string], description? [string], due_date? [Date], parent_group? [string]
     * 
     * Body Output: { _id: string, title: string, description: string, due_date?: Date, parent_group: string }[]
     */
    app.get("/assignment/get", normal_ops, AssignmentController.getAssignments);

    /**
     * Get assignment by id
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, title: string, description: string, due_date?: Date, parent_group: string }
     */
    app.get("/assignment/get/:id", normal_ops, AssignmentController.getAssignmentById);

    /**
     * Update assignment
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: { title: string, description: string, due_date?: Date }
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, title: string, description: string, due_date?: Date, parent_group: string }
     */
    app.put("/assignment/update/:id", coach_ops, AssignmentController.updateAssignment);

    /**
     * Delete assignment
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/assignment/delete/:id", coach_ops, AssignmentController.deleteAssignment);

}