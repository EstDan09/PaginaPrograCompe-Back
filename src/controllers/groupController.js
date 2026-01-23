const Group = require("../models/Group");
const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");

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
            const user = await User.findById(parent_coach);
            if (!user || user.role !== 'coach') {
                return res.status(400).json({ message: 'parent_coach must be a valid coach user ID' });
            }
        }
        const group = await Group.create({ name, description, parent_coach: (parent_coach ? parent_coach : req.user._id) });
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};  

exports.getGroupById = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteGroupInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.id;
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
        res.status(500).json({ message: 'Server error', error: error.message });
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};