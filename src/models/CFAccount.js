const mongoose = require('mongoose');
const { Schema } = mongoose;

const CFAccountSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true, immutable: true },
    cf_account: { type: String, required: true, index: true },
    is_verified_flag: {type: Boolean, required: true, default: false},
}, { timestamps: true });

module.exports = mongoose.model('CFAccount', CFAccountSchema);