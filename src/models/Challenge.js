const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChallengeSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    cf_code: { type: String, required: true, index: true, immutable: true },
    is_completed_flag: {type: Boolean, required: true, default: false},
    completion_type: {type: String, enum: ["contest", "normal"], required: false}
}, { timestamps: true });

ChallengeSchema.index({student_id: 1, cf_code: 1}, {unique: true})

module.exports = mongoose.model('Challenge', ChallengeSchema);