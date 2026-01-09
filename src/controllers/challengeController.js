const Challenge = require("../models/Challenge");
const User = require("../models/User");

exports.createChallenge = async (req, res) => {
    try {
        // TODO : Verify cf exercise beforehand/check for completion
        if (req.user.role === 'student' && req.params.student_id && req.param.student_id !== req.user._id) {
            return res.status(400).json({ message: 'Can\'t create challenge for other student' });
        }
        const student_id = req.params.student_id ? req.params.student_id : req.user._id;
        if (req.params.student_id) {
            if (!student_id || !require('mongoose').Types.ObjectId.isValid(student_id)) {
                return res.status(400).json({ message: 'Invalid student_id' });
            }
            const student = await User.findById(student_id);
            if (!student || student.role !== 'student') {
                return res.status(400).json({ message: 'Invalid student_id' });
            }
        }
        const { cf_code } = req.body;
        if (!cf_code) {
            return res.status(400).json({ message: 'Invalid cf_code' });
        }
        const challenge = await Challenge.create({
            student_id,
            cf_code
        });
        res.status(201).json({ message: 'Challenge created successfully', challenge });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const {student_id, cf_code, is_completed_flag, completion_type} = req.query;
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (cf_code) filter.cf_code = cf_code;
        if (is_completed_flag) filter.is_completed_flag = is_completed_flag;
        if (completion_type) filter.completion_type = completion_type;
        if (req.user.role === 'student') {
            if (student_id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            filter.student_id = req.user._id;
        }
        const challenges = await Challenge.find(filter);
        res.status(200).json({ challenges });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getChallengeById = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !require('mongoose').Types.ObjectId.isValid(challengeId)) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !require('mongoose').Types.ObjectId.isValid(challengeId)) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        if (req.user.role === 'student' && challenge.student_id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: 'You can only delete your own challenges' });
        }
        await challenge.deleteOne();
        res.status(200).json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !require('mongoose').Types.ObjectId.isValid(challengeId)) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        if (req.user.role === 'student' && challenge.student_id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: 'You can only verify your own challenges' });
        }
        // TODO : ask codeforces API if user did actually complete challenge
        const updateData = {
            is_completed_flag: true,
            completion_type: "normal"
        };
        const new_challenge = await Challenge.findByIdAndUpdate(challengeId, updateData, { new: true });
        res.status(200).json(new_challenge);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};