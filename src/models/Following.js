const mongoose = require('mongoose');
const { Schema } = mongoose;

const FollowingSchema = new Schema({
    student_1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    student_2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
}, { timestamps: true });

FollowingSchema.index({student_1_id: 1, student_2_id: 1}, {unique: true});

module.exports = mongoose.model('Following', FollowingSchema);