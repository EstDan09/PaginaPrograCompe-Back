const StudentExercise = require("../models/StudentExercise");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Group = require("../models/Group");
const StudentGroup = require("../models/StudentGroup");

exports.createStudentExercise = async (req, res) => {
    try {
        // TODO : Validate exercise completion with codeforces
        const student_id = req.params.student_id ? req.params.student_id : req.user._id;
        if (req.params.student_id) {
            const student = await User.findById(student_id);
            if (!student || student.role !== 'student') {
                return res.status(400).json({ message: 'Invalid student_id' });
            }
        }
        const { exercise_id } = req.body;
        const exercise = await Exercise.findById(exercise_id);
        if (!exercise) {
            return res.status(400).json({ message: 'Invalid exercise_id' });
        }
        const parent_assignment = exercise.parent_assignment;
        const assignment = await Assignment.findById(parent_assignment);
        const parent_group = assignment.parent_group;
        const membership = StudentGroup.findOne({student_id, group_id: parent_group});
        if (!membership) {
            return res.status(403).json({ message: 'Student may not solve this exercise' });
        }
        const studentExercise = StudentExercise.create({
            student_id,
            exercise_id
        });
        res.status(201).json({ message: 'Student exercise created successfully', studentExercise });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentExercises = async (req, res) => {
    try {
        const {group_id, assignment_id, exercise_id, student_id} = req.query;
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
        if (req.user.role === 'student') {
            if (student_id && student_id !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            } else filter.student_id = req.user._id;
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
        await studentExercise.remove();
        res.status(200).json({ message: 'Student exercise deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};