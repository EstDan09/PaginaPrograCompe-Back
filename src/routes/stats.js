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
     *     description: Retrieves aggregated statistics about a student's progress. Authentication Basic
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
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   type: object
     *                   properties:
     *                     userId:
     *                       type: string
     *                     cfHandle:
     *                       type: string
     *                     role:
     *                       type: string
     *                 kpis:
     *                   type: object
     *                   properties:
     *                     rating:
     *                       type: integer
     *                     solvedTotal:
     *                       type: integer
     *                     streakDays:
     *                       type: integer
     *                 ratingGraph:
     *                   type: object
     *                   properties:
     *                     min:
     *                       type: integer
     *                     max:
     *                       type: integer
     *                     series:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           t:
     *                             type: string
     *                             format: date
     *                           rating:
     *                             type: integer
     *                 solvesByRating:
     *                   type: object
     *                   properties:
     *                     binSize:
     *                       type: integer
     *                     bins:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           from:
     *                             type: integer
     *                           to:
     *                             type: integer
     *                           label:
     *                             type: string
     *                           solved:
     *                             type: integer
     *                 tags:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       tag:
     *                         type: string
     *                       solved:
     *                         type: integer
     *                 meta:
     *                   type: object
     *                   properties:
     *                     generatedAt:
     *                       type: string
     *                       format: date-time
     *                     source:
     *                       type: string
     *                     cacheTtlSeconds:
     *                       type: integer
     *       404:
     *         description: Student not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get("/stats/get-student-stats/:student_id", normal_ops, StatsController.getStudentStats);
};