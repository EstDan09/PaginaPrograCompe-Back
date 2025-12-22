const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        if (role && !['student', 'coach', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const newUser = await User.create({ username, password_hash: password, email, role });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const {id, username, password_hash, email, role} = req.query;
        const filter = {};

        if (id) filter._id = id;
        if (username) filter.username = username;
        if (password_hash) filter.password_hash = password_hash;
        if (email) filter.email = email;
        if (role) filter.role = role;

        const users = await User.find(filter, '_id username password_hash email role' );

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            username: user.username,
            password_hash: user.password_hash,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { password, email, role } = req.body;
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
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            username: user.username,
            password_hash: user.password_hash,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.safeGetUsers = async (req, res) => {
    try {
        const {id, username, email, role} = req.query;
        const filter = {};

        if (id) filter._id = id;
        if (username) filter.username = username;
        if (email) filter.email = email;
        if (role) {
            if (!['student', 'coach'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            filter.role = role;
        } else filter.role = { $ne: 'admin' };

        const users = await User.find(filter, '_id username email role' );

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.safeGetUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Access denied. Cannot view admin details.' });
        }
        res.status(200).json({ id: user._id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.safeUpdateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password, email} = req.body;
        const updateData = {};
        if (password) updateData.password_hash = password;
        if (email) updateData.email = email;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.safeDeleteUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.safeGetByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Access denied. Cannot view admin details.' });
        }
        res.status(200).json({ id: user._id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
