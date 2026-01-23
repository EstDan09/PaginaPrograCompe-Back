const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExerciseSchema = new Schema({
    name: { type: String, required: true },
    cf_code: { type: String, required: true, immutable: true },
    parent_assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true, immutable: true },
});

ExerciseSchema.pre('remove', async function(next) {
    try {
        await mongoose.model('StudentExercise').deleteMany({ exercise_id: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);