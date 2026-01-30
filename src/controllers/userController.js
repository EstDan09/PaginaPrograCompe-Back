const User = require('../models/User');
const CFAccount = require('../models/CFAccount');
const mongoose = require('mongoose');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isOptionalString = (value) => value === undefined || typeof value === 'string';

exports.createUser = async (req, res) => {
    try {
        const { username, password, email, role, cf_account } = req.body;
        if (!isNonEmptyString(username) || !isNonEmptyString(password) || !isNonEmptyString(email)) {
            return res.status(400).json({ message: 'Invalid username, password, or email' });
        }
        if (!isOptionalString(role) || !isOptionalString(cf_account)) {
            return res.status(400).json({ message: 'Invalid role or cf_account' });
        }
        if (role && !['student', 'coach', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if ((!role || role === 'student') && !cf_account) {
            return res.status(400).json({ message: 'Students must have associated Codeforces account' });
        }
        const newUser = await User.create({ username, password_hash: password, email, role });
        if (!role || role === 'student') {
            await CFAccount.create({student_id: newUser._id, cf_account});
        }
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const {username, password_hash, email, role} = req.query;
        if (![username, password_hash, email, role].every(isOptionalString)) {
            return res.status(400).json({ message: 'Invalid query parameters' });
        }
        const filter = {};

        if (username) filter.username = username;
        if (password_hash) filter.password_hash = password_hash;
        if (email) filter.email = email;
        if (role) filter.role = role;

        const users = await User.find(filter, '_id username password_hash email role' );

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password, email, role } = req.body;
        if (![password, email, role].every(isOptionalString)) {
            return res.status(400).json({ message: 'Invalid update fields' });
        }
        if (role && !['student', 'coach', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const updateData = {};
        if (password) updateData.password_hash = password;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        if (!isNonEmptyString(username)) {
            return res.status(400).json({ message: 'Invalid username' });
        }
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.safeGetUsers = async (req, res) => {
    try {
        const {username, email, role} = req.query;
        if (![username, email, role].every(isOptionalString)) {
            return res.status(400).json({ message: 'Invalid query parameters' });
        }
        const filter = {};

        if (username) filter.username = username;
        if (email) filter.email = email;
        if (role) {
            if (!['student', 'coach'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            filter.role = role;
        } else filter.role = mongoose.trusted({ $ne: 'admin' });

        const users = await User.find(filter, '_id username email role' );
        
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.safeGetUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = await User.findById(userId, "_id username email role");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Access denied. Cannot view admin details.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.safeUpdateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password, email} = req.body;
        if (![password, email].every(isOptionalString)) {
            return res.status(400).json({ message: 'Invalid update fields' });
        }
        const updateData = {};
        if (password) updateData.password_hash = password;
        if (email) updateData.email = email;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('_id username email role')
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.safeDeleteUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'Self user deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId, '_id username email role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.safeGetByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        if (!isNonEmptyString(username)) {
            return res.status(400).json({ message: 'Invalid username' });
        }
        const user = await User.findOne({username}, '_id username email role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Access denied. Cannot view admin details.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
