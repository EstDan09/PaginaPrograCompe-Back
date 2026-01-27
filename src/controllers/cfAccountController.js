const CFAccount = require("../models/CFAccount");
const jwt = require('jsonwebtoken');
const CodeforcesService = require("../services/codeforces");

exports.myCFAccount = async (req, res) => {
    try {
        const cfAccount = await CFAccount.findOne({student_id: req.user._id});
        if (!cfAccount) {
           return res.status(500).json({ message: 'Server error: no associated CFAccount' }); 
        }
        res.status(200).json(cfAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCFAccounts = async (req, res) => {
    try {
        const {student_id, cf_account, is_verified_flag} = req.query;
        const filter = {};
        if (student_id) filter.student_id = student_id;
        if (cf_account) filter.cf_account = cf_account;
        if (is_verified_flag) filter.is_verified_flag = is_verified_flag;
        const cfAccounts = await CFAccount.find(filter);
        res.status(200).json({ cfAccounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCFAccount = async (req, res) => {
    try {
        const cfAccountId = req.params.id;
        if (!cfAccountId || !require('mongoose').Types.ObjectId.isValid(cfAccountId)) {
            return res.status(404).json({ message: 'CFAccount not found' });
        }
        const cfAccount = await CFAccount.findById(cfAccountId);
        if (!cfAccount) {
            return res.status(404).json({ message: 'CFAccount not found' });
        }
        res.status(200).json(cfAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.startVerifyCFAccount = async (req, res) => {
    try {
        const cfAccount = await CFAccount.findOne({student_id: req.user._id});
        if (!cfAccount) {
           return res.status(500).json({ message: 'Server error: no associated CFAccount' }); 
        }
        const cf_problem = await CodeforcesService.getRandomValidProblem();
        const cf_code = cf_problem.cf_code;
        const verify_token = jwt.sign({ _id: req.user._id, cf_code }, process.env.SECRET_KEY, { expiresIn: `${CodeforcesService.verifyProblemTimelimitSeconds}s` });
        res.status(200).json({verification_token: verify_token, cf_code});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.endVerifyCFAccount = async (req, res) => {
    try {
        const verify_token = req.params.verify_token;
        const decoded = jwt.verify(verify_token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        if (decoded._id !== req.user._id) {
            return res.status(400).json({ message: 'Can\'t validate another students account' });
        }
        const cf_code = decoded.cf_code;
        const cfAccount = await CFAccount.findOne({student_id: req.user._id});
        if (!cfAccount) {
           return res.status(500).json({ message: 'Server error: no associated CFAccount' }); 
        }
        if (await CodeforcesService.verifyProblemCompilationErrorRecent(cfAccount.cf_account, cf_code) === false) {
            return res.status(400).json({ message: 'Verification problem not submitted yet.' });
        }
        const updateData = {
            is_verified_flag: true
        };
        const updatedCFAccount = await CFAccount.findByIdAndUpdate(cfAccount._id, updateData, { new: true });
        res.status(200).json(updatedCFAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCFAccount = async (req, res) => {
    try {
        const cfAccountId = req.params.id;
        if (!cfAccountId || !require('mongoose').Types.ObjectId.isValid(cfAccountId)) {
            return res.status(404).json({ message: 'CFAccount not found' });
        }
        const cfAccount = await CFAccount.findById(cfAccountId);
        if (!cfAccount) {
           return res.status(500).json({ message: 'Server error: no associated CFAccount' }); 
        }
        const {cf_account} = req.body;
        const updateData = {};
        if (cf_account) updateData.cf_account = cf_account, updateData.is_verified_flag = false;
        const updatedCFAccount = await CFAccount.findByIdAndUpdate(cfAccount._id, updateData, { new: true });
        res.status(200).json(updatedCFAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};