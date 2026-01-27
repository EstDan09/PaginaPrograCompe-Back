const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlockedUserSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    blocked_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true }
}, { timestamps: true });

BlockedUserSchema.index({user_id: 1, blocked_user_id: 1}, {unique: true})

module.exports = mongoose.model('BlockedUser', BlockedUserSchema);