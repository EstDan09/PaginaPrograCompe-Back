const StatsController = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");
const coachMiddleware = require("../middlewares/coachMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    app.get("/stats/get-student-stats/:studentId", normal_ops, StatsController.getStudentStats);
};