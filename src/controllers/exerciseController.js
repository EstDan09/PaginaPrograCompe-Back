const mongoose = require('mongoose');
const Group = require("../models/Group");
const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");
const Assignment = require("../models/Assignment");
const Exercise = require("../models/Exercise");
const CodeforcesService = require("../services/codeforces");

exports.createExercise = async (req, res) => {
    try {
        const { name, cf_code, parent_assignment } = req.body;
        if (!name || !parent_assignment || !cf_code) {
            return res.status(400).json({ message: 'Name, cf_code, and parent_assignment are required' });
        }
        if (!(await CodeforcesService.validateCfCode(cf_code))) {
            return res.status(400).json({ message: 'Invalid cf_code' });
        }
        if (!mongoose.Types.ObjectId.isValid(parent_assignment)) {
            return res.status(400).json({ message: 'Invalid parent_assignment' });
        }
        const assignment = await Assignment.findById(parent_assignment);
        if (!assignment) {
            return res.status(400).json({ message: 'Invalid parent_assignment' });
        }
        const parent_group = assignment.parent_group;
        const group = await Group.findById(parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to create exercises for this group' });
        }
        const newExercise = await Exercise.create({
            name,
            cf_code,
            parent_assignment: parent_assignment
        });
        res.status(201).json(newExercise);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getExercises = async (req, res) => {
    try {
        const { name, cf_code, parent_assignment } = req.query;
        const filter = {};
        if (name) filter.name = name;
        if (cf_code) filter.cf_code = cf_code;
        if (parent_assignment) filter.parent_assignment = parent_assignment;
        if (req.user.role !== 'admin') {
            const groups = req.user.role === 'coach' ?
               await Group.find({ parent_coach: req.user._id }).select('_id') :
               await StudentGroup.find({ student_id: req.user._id }).select('group_id'); 
            const groupIds = groups.map(g => req.user.role === 'coach' ? g._id : g.group_id);
            const assignments = await Assignment.find({ parent_group: { $in: groupIds } }).select('_id');
            const assignmentIds = assignments.map(a => a._id);
            if (parent_assignment && !assignmentIds.includes(parent_assignment)) {
                return res.status(403).json({ message: 'You do not have permission to view exercises for this assignment' });
            } else filter.parent_assignment = { $in: assignmentIds };
        }
        const exercises = await Exercise.find(filter);
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        const assignment = await Assignment.findById(exercise.parent_assignment);
        if (req.user.role === 'coach') {
            const group = await Group.findById(assignment.parent_group);
            if (group.parent_coach.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You do not have permission to view this exercise' });
            }
        } else if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: assignment.parent_group });
            if (!membership) {
                return res.status(403).json({ message: 'You do not have permission to view this exercise' });
            }
        }
        res.status(200).json(exercise);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        const assignment = await Assignment.findById(exercise.parent_assignment);
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this exercise' });
        }
        const { name } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        const updatedExercise = await Exercise.findByIdAndUpdate(exerciseId, updateData, { new: true });
        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        const assignment = await Assignment.findById(exercise.parent_assignment);
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this exercise' });
        }
        await exercise.deleteOne();
        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};