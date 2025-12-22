const User = require("../models/userModel");
const StudentGroup = require("../models/studentGroupModel");
const Group = require("../models/groupModel");

exports.createStudentGroup = async (req, res) => {
    try {
        const { student_id, group_id } = req.body;
        const student = await User.findById(student_id);
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student_id' });
        }
        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(400).json({ message: 'Invalid group_id' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to add students to this group' });
        }
        const newStudentGroup = StudentGroup.create({ student_id, group_id });
        res.status(201).json(newStudentGroup);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentGroups = async (req, res) => {
    try {
        const { student_id, group_id } = req.query;
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (group_id) filter.group_id = group_id;
        if (req.user.role === 'student') {
            if (student_id && student_id !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            } else filter.student_id = req.user._id;
        } else if (req.user.role === 'coach') {
            const coachGroups = await Group.find({ parent_coach: req.user._id }).select('_id');
            const coachGroupIds = coachGroups.map(g => g._id.toString());
            if (group_id && !coachGroupIds.includes(group_id)) {
                return res.status(403).json({ message: 'You do not have permission to view student groups for this group' });
            } else filter.group_id = { $in: coachGroupIds };
        }
        const studentGroups = await StudentGroup.find(filter);
        res.status(200).json(studentGroups);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentGroupById = async (req, res) => {
    try {
        const studentGroupId = req.params.id;
        const studentGroup = await StudentGroup.findById(studentGroupId);
        if (!studentGroup) {
            return res.status(404).json({ message: 'StudentGroup not found' });
        }
        res.status(200).json(studentGroup);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteStudentGroup = async (req, res) => {
    try {
        const studentGroupId = req.params.id;
        const studentGroup = await StudentGroup.findById(studentGroupId);
        if (!studentGroup) {
            return res.status(404).json({ message: 'StudentGroup not found' });
        }
        if (req.user.role === 'coach') {
            const group = await Group.findById(studentGroup.group_id);
            if (group.parent_coach.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You do not have permission to delete this student from the group' });
            }
        }
        await studentGroup.remove();
        res.status(200).json({ message: 'StudentGroup deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};