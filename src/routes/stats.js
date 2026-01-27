// TODO: fix
const StatsController = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

const normal_ops = [authMiddleware.auth];

module.exports = (app) => {
    /**
     * @openapi
     * /stats/get-student-stats/{studentId}:
     *   get:
     *     tags:
     *       - Statistics
     *     summary: Get student statistics
     *     description: Retrieves aggregated statistics about a student's progress
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - name: studentId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Student statistics retrieved
     *       404:
     *         description: Student not found
     *       500:
     *         description: Server error
     */
    app.get("/stats/get-student-stats/:studentId", normal_ops, StatsController.getStudentStats);
};