const User = require("../models/User");
const CFAccount = require("../models/CFAccount");
const CodeforcesService = require("../services/codeforces");
const mongoose = require('mongoose');
exports.getStudentStats = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }
        const cfAccount = await CFAccount.findOne({student_id: studentId});
        if (!cfAccount) {
            return res.status(400).json({ message: 'Student does not have a Codeforces account linked' });
        }
        const kpis = await CodeforcesService.getStudentKPIs(cfAccount.cf_account);
        const ratingGraph = await CodeforcesService.getStudentRatingGraph(cfAccount.cf_account);
        const solvesByRating = await CodeforcesService.getStudentSolvesByRating(cfAccount.cf_account);
        const tags = await CodeforcesService.getStudentSolvedTags(cfAccount.cf_account);
        res.status(200).json({
            user: {
                userId: student._id,
                cfHandle: cfAccount.cf_account,
                role: student.role
            },
            kpis,
            ratingGraph,
            solvesByRating,
            tags,
            meta: {
                generatedAt: new Date().toISOString(),
                source: "codeforces+db",
                cacheTtlSeconds: 3600
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

