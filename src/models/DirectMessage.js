const mongoose = require('mongoose');
const { Schema } = mongoose;

const DirectMessageSchema = new Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    message: { type: String, required: true }
}, { timestamps: true });

DirectMessageSchema.index({sender_id: 1, receiver_id: 1, createdAt: -1});

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);