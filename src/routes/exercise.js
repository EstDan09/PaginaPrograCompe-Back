const ExerciseController = require("../controllers/exerciseController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const coach_ops = [authMiddleware.auth, coachMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create exercise
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: { name: string, cf_code: string, parent_assignment: string }
     * 
     * Body Output: { _id: string, name: string, cf_code: string, parent_assignment: string }
     */
    app.post("/exercise/create", coach_ops, ExerciseController.createExercise);

    /**
     * Get exercises by filters
     * 
     * Previous authentication: Basic
     * 
     * UrlQuery Input: name? [string], cf_code? [string], parent_assignment? [string]
     * 
     * Body Output: { _id: string, name: string, cf_code: string, parent_assignment: string }[]
     */
    app.get("/exercise/get", normal_ops, ExerciseController.getExercises);

    /**
     * Get exercise by id
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, name: string, cf_code: string, parent_assignment: string }
     */
    app.get("/exercise/get/:id", normal_ops, ExerciseController.getExerciseById);

    /**
     * Update exercise
     * 
     * Previous authentication: Admin/Coach
     * 
     * Body Input: { name: string }
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, name: string, cf_code: string, parent_assignment: string }
     */
    app.put("/exercise/update/:id", coach_ops, ExerciseController.updateExercise);

    /**
     * Delete exercise
     * 
     * Previous authentication: Admin/Coach
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/exercise/delete/:id", coach_ops, ExerciseController.deleteExercise);
}