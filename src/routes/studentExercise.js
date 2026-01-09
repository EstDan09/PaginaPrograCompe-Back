const StudentExerciseController = require("../controllers/studentExerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create student exercise link as student
     * 
     * Previous authentication: Student
     * 
     * Body Input: { exercise_id: string }
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string, completion_type: string }
     */
    app.post("/student-exercise/create", fstudent_ops, StudentExerciseController.createStudentExercise);

    /**
     * Create student exercise link as admin
     * 
     * Previous authentication: Admin
     * 
     * Body Input: { exercise_id: string }
     * UrlParam Input: :student_id [string]
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string, completion_type: string }
     */
    app.post("/student-exercise/create/:student_id", admin_ops, StudentExerciseController.createStudentExercise);

    /**
     * Get student exercise links by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: student_id? [string], exercise_id? [string], assignment_id? [string], group_id? [string], completion_type? [string]
     * # Notice that at most one of exercise_id, assignment_id, and group_id, can be used.
     * # Also, filtering by group_id looks for the parent recursively
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string, completion_type: string }[]
     */
    app.get("/student-exercise/get", normal_ops, StudentExerciseController.getStudentExercises);

    /**
     * Get student exercise link by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string, completion_type: string }
     */
    app.get("/student-exercise/get/:id", admin_ops, StudentExerciseController.getStudentExerciseById);

    /**
     * Delete student exercise link
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/student-exercise/delete/:id", admin_ops, StudentExerciseController.deleteStudentExercise);
}