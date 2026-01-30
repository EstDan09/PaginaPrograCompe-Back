const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const CFAccount = require('../models/CFAccount');
const CodeforcesService = require('../services/codeforces');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isOptionalString = (value) => value === undefined || typeof value === 'string';

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        let json = { _id: user._id, role: user.role };
        if (user.role === 'student') {
            const cfAccount = await CFAccount.findOne({ student_id: user._id });
            if (!cfAccount) {
                return res.status(400).json({ message: 'Associated Codeforces account not found' });
            }
            json.cf_handle = cfAccount.cf_account;
        }
        const token = jwt.sign(json, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { username, password, email, role, cf_account } = req.body;
        if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(email)) {
            return res.status(400).json({ message: 'Invalid username, password, or email' });
        }
        if (!isOptionalString(role) || !isOptionalString(cf_account)) {
            return res.status(400).json({ message: 'Invalid role or cf_account' });
        }
        if (role && !['student', 'coach'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if ((!role || role === 'student') && !cf_account) {
            return res.status(400).json({ message: 'Must specify associated Codeforces account for student' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const newUser = await User.create({ username, password_hash: password, email, role });
        if (!role || role === 'student') {
            if (!cf_account) {
                return res.status(400).json({ message: 'Must specify associated Codeforces account for student' });
            }
            if (!(await CodeforcesService.verifyExistingCodeforcesAccount(cf_account))) {
                return res.status(400).json({ message: 'Specified Codeforces account does not exist' });
            }
            await CFAccount.create({student_id: newUser._id, cf_account});
        }
        let json = { _id: newUser._id, role: newUser.role };
        if (newUser.role === 'student') {
            json.cf_handle = cf_account;
        }
        const token = jwt.sign(json, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        let json = { _id: decoded._id, role: decoded.role };
        if (decoded.role === 'student') {
            json.cf_handle = decoded.cf_handle;
        }
        const newToken = jwt.sign(json, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token: newToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
