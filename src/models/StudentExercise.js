const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentExerciseSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('StudentExercise', StudentExerciseSchema);