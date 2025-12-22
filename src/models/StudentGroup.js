const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentGroupSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('StudentGroup', StudentGroupSchema);