const StudentExerciseController = require("../controllers/studentExerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/student-exercise/create", student_ops, StudentExerciseController.createStudentExercise);
    app.post("/student-exercise/create/:student_id", admin_ops, StudentExerciseController.createStudentExercise);
    app.get("/student-exercise/get", admin_ops, StudentExerciseController.getStudentExercises);
    app.get("/student-exercise/get/:id", admin_ops, StudentExerciseController.getStudentExerciseById);
    app.delete("/student-exercise/delete/:id", admin_ops, StudentExerciseController.deleteStudentExercise);

    app.get("/student-exercise/get-by-student", normal_ops, StudentExerciseController.getStudentExercisesByStudent);
    app.get("/student-exercise/get-by-student/:student_id", coach_ops, StudentExerciseController.getStudentExercisesByStudent);
    app.get("/student-exercise/get-by-exercise/:exercise_id", normal_ops, StudentExerciseController.getStudentExercisesByExercise);
}