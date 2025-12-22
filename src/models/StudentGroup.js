const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentGroupSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true, immutable: true },
}, { timestamps: true });

StudentGroupSchema.index({student_id: 1, group_id: 1}, {unique: true})

module.exports = mongoose.model('StudentGroup', StudentGroupSchema);