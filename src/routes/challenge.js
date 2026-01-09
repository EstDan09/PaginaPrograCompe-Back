const ChallengeController = require("../controllers/challengeController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const fstudentMiddleware = require("../middlewares/fstudentMiddleware");
const studentMiddleware = require("../middlewares/studentMiddleware");

const admin_ops = [authMiddleware.auth, adminMiddleware.auth];
const fstudent_ops = [authMiddleware.auth, fstudentMiddleware.auth];
const student_ops = [authMiddleware.auth, studentMiddleware.auth];
const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Create challenge as student
     * 
     * Previous authentication: Student
     * 
     * Body Input: { exercise_id: string }
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
     */
    app.post("/challenge/create", fstudent_ops, ChallengeController.createChallenge);

    /**
     * Create challenge as admin
     * 
     * Previous authentication: Admin
     * 
     * Body Input: { student_id: string, exercise_id: string }
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
     */
    app.post("/challenge/create/:student_id", admin_ops, ChallengeController.createChallenge);

    /**
     * Get challenges by filters
     * 
     * Previous authentication: Admin/Student
     * 
     * UrlQuery Input: student_id? [string], exercise_id? [string], assignment_id? [string], group_id? [string]
     * # Notice that at most one of exercise_id, assignment_id, and group_id, can be used.
     * # Also, filtering by group_id looks for the parent recursively
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }[]
     */
    app.get("/challenge/get", student_ops, ChallengeController.getChallenges);

    /**
     * Get challenge by id
     * 
     * Previous authentication: Admin
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: { _id: string, student_id: string, exercise_id: string }
     */
    app.get("/challenge/get/:id", admin_ops, ChallengeController.getChallengeById);

    /**
     * Delete challenge
     * 
     * Previous authentication: Admin/Student
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.delete("/challenge/delete/:id", student_ops, ChallengeController.deleteChallenge);

    /**
     * Verify challenge completion
     * 
     * Previous authentication: Admin/Student
     * 
     * UrlParam Input: :id [string]
     * 
     * Body Output: N/A
     */
    app.put("/challenge/verify/:id", student_ops, ChallengeController.verifyChallenge);

    // TODO
    //app.get("/challenge/ask", fstudent_ops, ChallengeController.askChallenge);
}