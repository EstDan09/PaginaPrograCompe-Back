const Group = require("../models/Group");
const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");
const Assignment = require("../models/Assignment");

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, parent_group } = req.body;
        if (!title || !parent_group) {
            return res.status(400).json({ message: 'Title and parent_group are required' });
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
            dueDate,
            parent_group
        });
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        const { title, description, dueDate, parent_group } = req.query;
        const filter = {};
        if (title) filter.title = title;
        if (description) filter.description = description;
        if (dueDate) filter.dueDate = dueDate;
        if (parent_group) filter.parent_group = parent_group;

        if (req.user.role === 'coach') {
            const coachGroups = await Group.find({ parent_coach: req.user._id }).select('_id');
            const coachGroupIds = coachGroups.map(g => g._id);
            if (parent_group && !coachGroupIds.includes(parent_group)) {
                return res.status(403).json({ message: 'You do not have permission to view assignments for this group' });
            } else filter.parent_group = { $in: coachGroupIds };
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
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'admin') {
            const { title, description, dueDate, parent_group } = req.body;
            const updateData = {};
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (dueDate) updateData.dueDate = dueDate;
            if (parent_group) updateData.parent_group = parent_group;
            const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, updateData, { new: true });
            res.status(200).json(updatedAssignment);
            return;
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this assignment' });
        }
        const { title, description, dueDate } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (dueDate) updateData.dueDate = dueDate;
        const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, updateData, { new: true });
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        const group = await Group.findById(assignment.parent_group);
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
        }
        await assignment.remove();
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAssignmentsByGroup = async (req, res) => {
    try {
        const parent_group = req.params.parent_group;
        const group = await Group.findById(parent_group);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to view assignments for this group' });
        }
        if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: parent_group });
            if (!membership) {
                return res.status(403).json({ message: 'You do not have permission to view assignments for this group' });
            }
        }
        const assignments = await Assignment.find({ parent_group });
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};