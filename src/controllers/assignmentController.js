const mongoose = require('mongoose');
const Group = require("../models/Group");
const StudentGroup = require("../models/StudentGroup");
const Assignment = require("../models/Assignment");
const Exercise = require("../models/Exercise");
const CodeforcesService = require("../services/codeforces");

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, due_date, parent_group } = req.body;
        if (!title || !parent_group) {
            return res.status(400).json({ message: 'Title and parent_group are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(parent_group)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }
        const group = await Group.findById(parent_group);
        if (!group) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to create assignments for this group' });
        }
        const newAssignment = await Assignment.create({
            title,
            description,
            due_date,
            parent_group
        });
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        const { title, description, due_date, parent_group } = req.query;
        const filter = {};
        if (title) filter.title = title;
        if (description) filter.description = description;
        if (due_date) filter.due_date = due_date;
        if (parent_group) filter.parent_group = parent_group;
        if (req.user.role !== 'admin') {
            const groups = req.user.role === 'coach' ? 
                await Group.find({ parent_coach: req.user._id }).select('_id') :
                await StudentGroup.find({student_id: req.user._id}).select('group_id');
            const groupIds = groups.map(g => req.user.role === 'coach' ? g._id.toString() : g.group_id.toString());
            if (parent_group && !groupIds.includes(parent_group)) {
                return res.status(403).json({ message: 'You do not have permission to view assignments for this group' });
            } else filter.parent_group = { $in: groupIds };
        }
        const assignments = await Assignment.find(filter);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAssignmentById = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (req.user.role === 'coach') {
            const group = await Group.findById(assignment.parent_group);
            if (group.parent_coach.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You do not have permission to view this assignment' });
            }
        } else if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: assignment.parent_group });
            if (!membership) {
                return res.status(403).json({ message: 'You do not have permission to view this assignment' });
            }
        }
        res.status(200).json(assignment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this assignment' });
        }
        const { title, description, due_date } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (due_date) updateData.due_date = due_date;
        const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, updateData, { new: true });
        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
        }
        await assignment.deleteOne();
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createAssignmentWithExercises = async (req, res) => {
    try {
        const { title, description, due_date, parent_group, exercises } = req.body;
        if (!title || !parent_group) {
            return res.status(400).json({ message: 'Title and parent_group are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(parent_group)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }
        const group = await Group.findById(parent_group);
        if (!group) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to create assignments for this group' });
        }
        if (!exercises) {
            return res.status(400).json({ message: 'Exercises are required' });
        }
        for (const {name, cf_code} of exercises) {
            if (!name || !cf_code) {
                return res.status(400).json({ message: 'Each exercise needs a name and a code' });
            }
            if (!(await CodeforcesService.validateCfCode(cf_code))) {
                return res.status(400).json({ message: 'Each cf_code must be valid' });
            }
        }
        const newAssignment = await Assignment.create({
            title,
            description,
            due_date,
            parent_group
        });
        for (const {name, cf_code} of exercises) {
            await Exercise.create({
                name,
                cf_code,
                parent_assignment: newAssignment._id
            });
        }
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
