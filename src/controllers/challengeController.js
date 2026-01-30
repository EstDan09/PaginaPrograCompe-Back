const Challenge = require("../models/Challenge");
const User = require("../models/User");
const CodeforcesService = require("../services/codeforces");
const mongoose = require('mongoose');

exports.createChallenge = async (req, res) => {
    try {
        if (req.user.role === 'student' && req.params.student_id && req.param.student_id !== req.user._id) {
            return res.status(400).json({ message: 'Can\'t create challenge for other student' });
        }
        const student_id = req.params.student_id ? req.params.student_id : req.user._id;
        if (req.params.student_id) {
            if (!student_id || !mongoose.Types.ObjectId.isValid(student_id)) {
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
        if (!(await CodeforcesService.validateCfCode(cf_code))) {
            return res.status(400).json({ message: 'Invalid cf_code' });
        }
        if (await Challenge.findOne({ student_id, cf_code })) {
            return res.status(400).json({ message: 'Challenge already exists for this student and problem' });
        }
        const challenge = await Challenge.create({
            student_id,
            cf_code
        });
        res.status(201).json({ message: 'Challenge created successfully', challenge });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getChallengeById = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !mongoose.Types.ObjectId.isValid(challengeId)) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(200).json(challenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !mongoose.Types.ObjectId.isValid(challengeId)) {
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyChallenge = async (req, res) => {
    try {
        const challengeId = req.params.id;
        if (!challengeId || !mongoose.Types.ObjectId.isValid(challengeId)) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        if (req.user.role === 'student' && challenge.student_id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: 'You can only verify your own challenges' });
        }
        const {solved, completionType} = await CodeforcesService.verifyProblemSolved(req.user.cf_handle, challenge.cf_code);
        if (!solved) {
            return res.status(400).json({ message: 'Challenge not yet completed on Codeforces' });
        }
        const updateData = {
            is_completed_flag: true,
            completion_type: completionType
        };
        const new_challenge = await Challenge.findByIdAndUpdate(challengeId, updateData, { new: true });
        res.status(200).json(new_challenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.askChallenge = async (req, res) => {
    try {
        const { min_rating, max_rating, tags } = req.query;
        let minRating = min_rating;
        let maxRating = max_rating;
        if (minRating !== undefined) {
            if (Array.isArray(minRating)) {
                return res.status(400).json({ message: 'Invalid min_rating' });
            }
            minRating = Number(minRating);
            if (Number.isNaN(minRating)) {
                return res.status(400).json({ message: 'Invalid min_rating' });
            }
        }
        if (maxRating !== undefined) {
            if (Array.isArray(maxRating)) {
                return res.status(400).json({ message: 'Invalid max_rating' });
            }
            maxRating = Number(maxRating);
            if (Number.isNaN(maxRating)) {
                return res.status(400).json({ message: 'Invalid max_rating' });
            }
        }
        let tagList = tags;
        if (tagList !== undefined) {
            if (Array.isArray(tagList)) {
                if (tagList.some(tag => tag === '')) {
                    return res.status(400).json({ message: 'Invalid tags' });
                }
            } else if (typeof tagList === 'string') {
                if (tagList === '') {
                    return res.status(400).json({ message: 'Invalid tags' });
                }
                tagList = tagList
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag !== '');
                if (tagList.length === 0) {
                    return res.status(400).json({ message: 'Invalid tags' });
                }
            } else {
                return res.status(400).json({ message: 'Invalid tags' });
            }
        }
        if (minRating !== undefined && maxRating !== undefined && minRating > maxRating) {
            return res.status(400).json({ message: 'min_rating cannot be greater than max_rating' });
        }
        const cf_problem = await CodeforcesService.getRandomUnsolvedFilteredProblem(
            req.user.cf_handle,
            minRating !== undefined ? minRating : 800,
            maxRating !== undefined ? maxRating : 3500,
            tagList !== undefined ? tagList : []
        );
        res.status(200).json(cf_problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
