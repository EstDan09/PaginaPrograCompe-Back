const StatsController = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * Get public stats for a student
     * 
     * Previous authentication: Basic
     * 
     * UrlParam Input: :studentId [string]
     * 
     * Body Output: SEE ENDPOINT DOCUMENTATION
     */
    app.get("/stats/get-student-stats/:studentId", normal_ops, StatsController.getStudentStats);
};