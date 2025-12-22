const ExerciseController = require("../controllers/exerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const coachMiddleware = require("../middlewares/adminMiddleware");
const studentMiddleware = require("../middlewares/adminMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.post("/exercise/create", coach_ops, ExerciseController.createExercise);
    app.get("/exercise/get", coach_ops, ExerciseController.getExercises);
    app.get("/exercise/get/:id", normal_ops, ExerciseController.getExerciseById);
    app.put("/exercise/update/:id", coach_ops, ExerciseController.updateExercise);
    app.delete("/exercise/delete/:id", coach_ops, ExerciseController.deleteExercise);

    app.get("/exercise/get-by-assignment/:parent_assignment", normal_ops, ExerciseController.getExercisesByAssignment);
}