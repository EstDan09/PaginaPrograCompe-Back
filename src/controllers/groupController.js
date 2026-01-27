const Group = require("../models/Group");
const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");
const Assignment = require("../models/Assignment");
const Exercise = require("../models/Assignment");
const mongoose = require('mongoose');

exports.createGroup = async (req, res) => {
    try {
        const { name, description, parent_coach} = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (req.user.role === 'admin') {
            if (!parent_coach) {
                return res.status(400).json({ message: 'Name and parent_coach are required' });
            }
            if (!mongoose.Types.ObjectId.isValid(parent_coach)) {
                return res.status(400).json({ message: 'Invalid parent_coach ID' });
            }
            const user = await User.findById(parent_coach);
            if (!user || user.role !== 'coach') {
                return res.status(400).json({ message: 'parent_coach must be a valid coach user ID' });
            }
        }
        const group = await Group.create({ name, description, parent_coach: (parent_coach ? parent_coach : req.user._id) });
        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const { name, description, parent_coach } = req.query;
        const filter = {};
        if (name) filter.name = name;
        if (description) filter.description = description;
        if (parent_coach) filter.parent_coach = parent_coach;
        if (req.user.role === 'coach') {
            if (parent_coach && parent_coach !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            } else filter.parent_coach = req.user._id;
        }
        const groups = await Group.find(filter);
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};  

exports.getGroupById = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: groupId });
            if (!membership) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { name, description } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        const updatedGroup = await Group.findByIdAndUpdate(groupId, updateData, { new: true });
        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await group.deleteOne();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const crypto = require('crypto');
        let inviteCode = crypto.randomBytes(16).toString('hex');
        
        let existingGroup = await Group.findOne({ invite_code: inviteCode });
        while (existingGroup) {
            inviteCode = crypto.randomBytes(16).toString('hex');
            existingGroup = await Group.findOne({ invite_code: inviteCode });
        }
        
        group.invite_code = inviteCode;
        await group.save();
        res.status(201).json({ invite_code: inviteCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (!group.invite_code) {
            return res.status(404).json({ message: 'No invite code found for this group' });
        }
        res.status(200).json({ invite_code: group.invite_code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (!group.invite_code) {
            return res.status(400).json({ message: 'No invite code to delete' });
        }
        await Group.findByIdAndUpdate(groupId, { $unset: { invite_code: '' } });
        res.status(200).json({ message: 'Invite code deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: groupId });
            if (!membership) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        res.status(200).json(group.group_messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendGroupMessage = async (req, res) => {
    try {
        const messageText = req.body.message;
        if (!messageText) {
            return res.status(400).json({ message: 'Message text is required' });
        }
        if (messageText.length > 1000) {
            return res.status(400).json({ message: 'Message text exceeds maximum length of 1000 characters' });
        }
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: groupId });
            if (!membership) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const newMessage = {
            sender_id: req.user._id,
            message: messageText,
            timestamp: new Date()
        };
        group.group_messages.push(newMessage);
        await group.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyGroupsSummary = async (req, res) => {
    try {
        let groups;
        if (req.user.role === 'coach') {
            groups = await Group.find({ parent_coach: req.user._id }).select('_id name description');
        } else if (req.user.role === 'student') {
            const studentGroups = await StudentGroup.find({ student_id: req.user._id }).select('group_id');
            const groupIds = studentGroups.map(sg => sg.group_id);
            groups = await Group.find({ _id: { $in: groupIds } }).select('_id name description');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
        const summary = await Promise.all(groups.map(async (group) => {
            const owner = await User.findById(group.parent_coach).select('username');
            const memberCount = await StudentGroup.countDocuments({ group_id: group._id });
            const role = (req.user.role === 'coach') ? 'Coach' : 'Student';
            let dueAssignmentsCount = 0;
            if (role === 'Student') {
                const assignments = await Assignment.find({ parent_group: group._id, due_date: { $gte: new Date() } });
                for (const assignment of assignments) {
                    const exercises = await Exercise.find({ parent_assignment: assignment._id });
                    let allCompleted = true;
                    for (const exercise of exercises) {
                        const completion = await mongoose.model('StudentExercise').findOne({ student_id: req.user._id, exercise_id: exercise._id });
                        if (!completion) {
                            allCompleted = false;
                            break;
                        }
                    }
                    if (!allCompleted) {
                        dueAssignmentsCount += 1;
                    }
                }
            }
            return {
                groupId: group._id,
                name: group.name,
                ownerUsername: owner.username,
                members: memberCount,
                dueAssignments: dueAssignmentsCount,
                role: role
            };
        }));
        res.status(200).json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getGroupDetails = async (req, res) => {
    try {
        const groupId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (req.user.role === 'coach' && group.parent_coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'student') {
            const membership = await StudentGroup.findOne({ student_id: req.user._id, group_id: groupId });
            if (!membership) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const owner = await User.findById(group.parent_coach).select('_id username role');
        const assignmentsData = await Assignment.find({ parent_group: group._id });
        const assignments = await Promise.all(assignmentsData.map(async (assignment) => {
            const exerciseCount = await Exercise.countDocuments({ parent_assignment: assignment._id });
            return {
                _id: assignment._id,
                title: assignment.title,
                description: assignment.description,
                due_date: assignment.due_date,
                exerciseCount: exerciseCount
            };
        }));
        res.status(200).json({
            group: {
                _id: group._id,
                name: group.name,
                description: group.description,
                owner: owner
            },
            assignments: assignments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};