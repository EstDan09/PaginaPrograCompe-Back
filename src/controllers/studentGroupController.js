const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");
const Group = require("../models/Group");
const mongoose = require('mongoose');

exports.createStudentGroup = async (req, res) => {
    try {
        const { student_id, group_id } = req.body;
        if (!student_id || !mongoose.Types.ObjectId.isValid(student_id)) {
            return res.status(400).json({ message: 'Invalid student_id' });
        }
        if (!group_id || !mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ message: 'Invalid group_id' });
        }
        const student = await User.findOne({ _id: student_id });
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
        const newStudentGroup = await StudentGroup.create({ student_id, group_id });
        res.status(201).json(newStudentGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addMemberGroup = async (req, res) => {
    try {
        const { student_username, group_id } = req.body;
        if (!student_username) {
            return res.status(400).json({ message: 'Invalid student_username' });
        }
        const student = await User.findOne({username: student_username});
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student_id' });
        }
        if (!group_id || !mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ message: 'Invalid group_id' });
        }
        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(400).json({ message: 'Invalid group_id' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to add students to this group' });
        }
        const newStudentGroup = await StudentGroup.create({ student_id: student._id, group_id });
        res.status(201).json(newStudentGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentGroups = async (req, res) => {
    try {
        const { student_id, group_id } = req.query;
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (group_id) filter.group_id = group_id;
        if (req.user.role === 'student') {
            if (student_id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            filter.student_id = req.user._id;
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentGroupById = async (req, res) => {
    try {
        const studentGroupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(studentGroupId)) {
            return res.status(404).json({ message: 'StudentGroup not found' });
        }
        const studentGroup = await StudentGroup.findById(studentGroupId);
        if (!studentGroup) {
            return res.status(404).json({ message: 'StudentGroup not found' });
        }
        res.status(200).json(studentGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStudentGroup = async (req, res) => {
    try {
        const studentGroupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(studentGroupId)) {
            return res.status(404).json({ message: 'StudentGroup not found' });
        }
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
        await studentGroup.deleteOne();
        res.status(200).json({ message: 'StudentGroup deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.useGroupInviteCode = async (req, res) => {
    try {
        const { invite_code } = req.body;
        if (!invite_code) {
            return res.status(400).json({ message: 'Invite code is required' });
        }
        const group = await Group.findOne({ invite_code: invite_code });
        if (!group) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }
        const existingMembership = await StudentGroup.findOne({ student_id: req.user._id, group_id: group._id });
        if (existingMembership) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }
        const newStudentGroup = await StudentGroup.create({ student_id: req.user._id, group_id: group._id });
        res.status(201).json(newStudentGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentGroupsWithUsername = async (req, res) => {
    try {
        const { student_id, group_id } = req.query;
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (group_id) filter.group_id = group_id;
        if (req.user.role === 'student') {
            if (student_id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            filter.student_id = req.user._id;
        } else if (req.user.role === 'coach') {
            const coachGroups = await Group.find({ parent_coach: req.user._id }).select('_id');
            const coachGroupIds = coachGroups.map(g => g._id.toString());
            if (group_id && !coachGroupIds.includes(group_id)) {
                return res.status(403).json({ message: 'You do not have permission to view student groups for this group' });
            } else filter.group_id = { $in: coachGroupIds };
        }
        const studentGroups = await StudentGroup.find(filter);
        const studentGroupsWithUsername = await Promise.all(studentGroups.map(async (student_group) => {
            const student = await User.findById(student_group.student_id).select('username');
            const student_username = student ? student.username : undefined;
            return {
                _id: student_group._id,
                student_id: student_group.student_id,
                group_id: student_group.group_id,
                student_username
            };
        }));
        res.status(200).json(studentGroupsWithUsername);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
