const User = require("../models/User");
const Following = require("../models/Following");

exports.createFollowing = async (req, res) => {
    try {
        const { student_1_id: student_1_id_p, student_2_id } = req.body;
        let student_1_id = student_1_id_p;
        if (!student_1_id && req.user.role === 'student') {
            student_1_id = req.user._id;
        }
        if (student_1_id === student_2_id) {
            return res.status(400).json({ message: 'Can\'t follow self' });
        }
        if (!student_1_id || !require('mongoose').Types.ObjectId.isValid(student_1_id)) {
            return res.status(400).json({ message: 'Invalid student_1_id' });
        }
        if (!student_2_id || !require('mongoose').Types.ObjectId.isValid(student_2_id)) {
            return res.status(400).json({ message: 'Invalid student_2_id' });
        }
        if (req.user.role === 'student' && req.user._id !== student_1_id) {
            return res.status(400).json({ message: 'You can only follow for yourself' });
        }
        const student_1 = await User.findOne({ _id: student_1_id });
        if (!student_1 || student_1.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student_1_id' });
        }
        const student_2 = await User.findOne({ _id: student_2_id });
        if (!student_2 || student_2.role !== 'student') {
            return res.status(400).json({ message: 'Invalid student_2_id' });
        }
        const newFollowing = await Following.create({ student_1_id, student_2_id });
        res.status(201).json(newFollowing);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { student_1_id, student_2_id } = req.query;
        const filter = {};
        if (student_1_id) filter.student_1_id = student_1_id;
        if (student_2_id) filter.student_2_id = student_2_id;
        if (req.user.role === 'student') {
            if (student_1_id && student_1_id !== req.user._id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            filter.student_1_id = req.user._id;
        }
        const followings = await Following.find(filter);
        res.status(200).json(followings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getFollowingById = async (req, res) => {
    try {
        const followingId = req.params.id;
        const following = await Following.findById(followingId);
        if (!following) {
            return res.status(404).json({ message: 'Following not found' });
        }
        res.status(200).json(following);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteFollowing = async (req, res) => {
    try {
        const followingId = req.params.id;
        const following = await Following.findById(followingId);
        if (!following) {
            return res.status(404).json({ message: 'Following not found' });
        }
        if (req.user.role === 'student' && following.student_1_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this following' });
        }
        await following.deleteOne();
        res.status(200).json({ message: 'Following deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.countFollowers = async (req, res) => {
    try {
        const userId = req.params.user_id;
        const count = await Following.countDocuments({student_2_id: userId});
        res.status(200).json({count});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};