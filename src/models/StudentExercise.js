const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentExerciseSchema = new Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
    exercise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true, immutable: true },
}, { timestamps: true });

StudentExerciseSchema.index({student_id: 1, exercise_id: 1}, {unique: true})

module.exports = mongoose.model('StudentExercise', StudentExerciseSchema);