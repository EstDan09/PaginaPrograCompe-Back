const StudentExerciseController = require("../controllers/studentExerciseController");
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
     * Create studer exercise link as student
     * 
     * Previous authentication: Student
     * 
     * Body Input: { student_id: string, exercise_id: string }
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
     */
    app.post("/student-exercise/create", student_ops, StudentExerciseController.createStudentExercise);

    /**
     * Create student exercise link as admin
     * 
     * Previous authentication: Admin
     * 
     * Body Input: { student_id: string, exercise_id: string }
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
     */
    app.post("/student-exercise/create/:student_id", admin_ops, StudentExerciseController.createStudentExercise);

    /**
     * Get student exercise links by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: id? [string], student_id? [string], exercise_id? [string]
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }[]
     */
    app.get("/student-exercise/get", normal_ops, StudentExerciseController.getStudentExercises);

    /**
     * Get student exercise link by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
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