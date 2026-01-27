const DirectMessage = require("../models/DirectMessage");
const BlockedUser = require("../models/BlockedUser");
const mongoose = require('mongoose');

exports.sendDirectMessage = async (req, res) => {
    try {
        const messageText = req.body.message;
        const receiver_id = req.params.user_id;
        const sender_id = req.user._id;

        if (!receiver_id || !mongoose.Types.ObjectId.isValid(receiver_id)) {
            return res.status(400).json({ message: 'Invalid receiver_id' });
        }
        if (sender_id.toString() === receiver_id) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

        const isBlocked = await BlockedUser.findOne({ user_id: receiver_id, blocked_user_id: sender_id });
        if (isBlocked) {
            return res.status(403).json({ message: 'You are blocked by this user' });
        }

        const newMessage = await DirectMessage.create({ sender_id, receiver_id, message: messageText });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const messages = await DirectMessage.find({ 
            $or: [
                { sender_id: userId },
                { receiver_id: userId }
            ]
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();
        messages.forEach(msg => {
            const partnerId = msg.sender_id.toString() === userId.toString() ? msg.receiver_id.toString() : msg.sender_id.toString();
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, msg);
            }
        });

        const conversationPartners = Array.from(conversationMap.keys());

        res.status(200).json(conversationPartners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.user_id;

        if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid user_id' });
        }

        const messages = await DirectMessage.find({
            $or: [
                { sender_id: userId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: userId }
            ]
        }).sort({ createdAt: 1 });
        
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const blockedUserId = req.params.user_id;

        if (!blockedUserId || !mongoose.Types.ObjectId.isValid(blockedUserId)) {
            return res.status(400).json({ message: 'Invalid user_id' });
        }
        if (userId.toString() === blockedUserId) {
            return res.status(400).json({ message: 'Cannot block yourself' });
        }

        const existingBlock = await BlockedUser.findOne({ user_id: userId, blocked_user_id: blockedUserId });
        if (existingBlock) {
            return res.status(400).json({ message: 'User is already blocked' });
        }

        const newBlock = await BlockedUser.create({ user_id: userId, blocked_user_id: blockedUserId });
        res.status(201).json(newBlock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const blockedUserId = req.params.user_id;

        if (!blockedUserId || !mongoose.Types.ObjectId.isValid(blockedUserId)) {
            return res.status(400).json({ message: 'Invalid user_id' });
        }

        const blockRecord = await BlockedUser.findOne({ user_id: userId, blocked_user_id: blockedUserId });
        if (!blockRecord) {
            return res.status(404).json({ message: 'Blocked user not found' });
        }

        await BlockedUser.deleteOne({ _id: blockRecord._id });
        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const blockedUsers = await BlockedUser.find({ user_id: userId }).select('blocked_user_id -_id');
        const blockedUserIds = blockedUsers.map(bu => bu.blocked_user_id);
        res.status(200).json(blockedUserIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
