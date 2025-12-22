const Group = require("../models/Group");
const User = require("../models/User");
const StudentGroup = require("../models/StudentGroup");

exports.createGroup = async (req, res) => {
    try {
        const { name, description, parent_coach } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (req.user.role === 'admin') {
            if (!parent_coach) {
                return res.status(400).json({ message: 'Name and parent_coach are required' });
            }
            const user = User.findById(parent_coach);
            if (!user || user.role !== 'coach') {
                return res.status(400).json({ message: 'parent_coach must be a valid coach user ID' });
            }
        } else if (req.user.role === 'coach') {
            parent_coach = req.user._id;
        }
        const group = Group.create({ name, description, parent_coach });
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
        await group.remove();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};