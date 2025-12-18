const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'coach', 'admin'], default: 'student' },
    child_groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

module.exports = mongoose.model('User', UserSchema);