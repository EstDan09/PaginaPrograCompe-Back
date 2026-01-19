const StudentExercise = require("../models/StudentExercise");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Group = require("../models/Group");
const StudentGroup = require("../models/StudentGroup");
const CFAccount = require("../models/CFAccount");
const CodeforcesService = require("../services/codeforces");

exports.createStudentExercise = async (req, res) => {
    try {
        let student_id = req.user._id;
        let cf_handle = req.user.cf_handle;
        if (req.params.student_id) {
            student_id = req.params.student_id;
            if (!student_id || !require('mongoose').Types.ObjectId.isValid(student_id)) {
                return res.status(400).json({ message: 'Invalid student_id' });
            }
            const student = await User.findById(student_id);
            if (!student || student.role !== 'student') {
                return res.status(400).json({ message: 'Invalid student_id' });
            }
            cf_handle = (await CFAccount.findOne({ student_id })).cf_account;
        } else if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can create student exercises under their own name' });
        }
        const { exercise_id } = req.body;
        if (!exercise_id || !require('mongoose').Types.ObjectId.isValid(exercise_id)) {
            return res.status(400).json({ message: 'Invalid exercise_id' });
        }
        const exercise = await Exercise.findById(exercise_id);
        if (!exercise) {
            return res.status(400).json({ message: 'Invalid exercise_id' });
        }
        const parent_assignment = exercise.parent_assignment;
        const assignment = await Assignment.findById(parent_assignment);
        const parent_group = assignment.parent_group;
        const membership = await StudentGroup.findOne({student_id, group_id: parent_group});
        if (!membership) {
            return res.status(403).json({ message: 'Student may not solve this exercise' });
        }
        let {solved, completionType} = await CodeforcesService.verifyProblemSolved(cf_handle, exercise.cf_code);
        if (!solved) {
            if (req.user.role === 'admin') completionType = 'normal';
            else return res.status(400).json({ message: 'Exercise not yet completed on Codeforces' });
        }
        const studentExercise = await StudentExercise.create({
            student_id,
            exercise_id,
            completion_type: completionType
        });
        res.status(201).json({ message: 'Student exercise created successfully', studentExercise });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentExercises = async (req, res) => {
    try {
        const {group_id, assignment_id, exercise_id, student_id, completion_type} = req.query;
        if ((group_id ? 1 : 0) + (assignment_id ? 1 : 0) + (exercise_id ? 1 : 0) > 1) {
            return res.status(400).json({ message: 'Query at most one of group_id, assignment_id, or exercise_id' });
        }
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (exercise_id) filter.exercise_id = exercise_id;
        if (assignment_id) {
            const exercises = await Exercise.find({ parent_assignment: assignment_id }).select('_id');
            const exerciseIds = exercises.map(e => e._id);
            filter.exercise_id = { $in: exerciseIds };
        }
        if (group_id) {
            const assignments = await Assignment.find({ parent_group: group_id }).select('_id');
            const assignmentIds = assignments.map(a => a._id);
            const exercises = await Exercise.find({ parent_assignment: { $in: assignmentIds } }).select('_id');
            const exerciseIds = exercises.map(e => e._id);
            filter.exercise_id = { $in: exerciseIds };
        }
        if (completion_type) filter.completion_type = completion_type;
        if (req.user.role === 'student') {
            if (student_id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            filter.student_id = req.user._id;
        } else if (req.user.role === 'coach') {
            if (group_id) {
                const group = await Group.findById(group_id);
                if (group.parent_coach.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: 'You do not have permission to view student exercises for this group' });
                }
            } else {
                const coachGroups = await Group.find({ parent_coach: req.user._id }).select('_id');
                const coachGroupIds = coachGroups.map(g => g._id);
                const coachAssignments = await Assignment.find({ parent_group: { $in: coachGroupIds } }).select('_id');
                const coachAssignmentIds = coachAssignments.map(a => a._id);
                const coachExercises = await Exercise.find({ parent_assignment: { $in: coachAssignmentIds } }).select('_id');
                const coachExerciseIds = coachExercises.map(e => e._id);
                filter.exercise_id = { $in: coachExerciseIds };
            }
        }
        const studentExercises = await StudentExercise.find(filter);
        res.status(200).json({ studentExercises });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentExerciseById = async (req, res) => {
    try {
        const studentExerciseId = req.params.id;
        const studentExercise = await StudentExercise.findById(studentExerciseId);
        if (!studentExercise) {
            return res.status(404).json({ message: 'StudentExercise not found' });
        }
        res.status(200).json(studentExercise);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteStudentExercise = async (req, res) => {
    try {
        const studentExerciseId = req.params.id;
        const studentExercise = await StudentExercise.findById(studentExerciseId);
        if (!studentExercise) {
            return res.status(404).json({ message: 'StudentExercise not found' });
        }
        await studentExercise.deleteOne();
        res.status(200).json({ message: 'Student exercise deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};