const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignmentSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    due_date: { type: Date, required: false },
    parent_group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
});

AssignmentSchema.pre('remove', async function(next) {
    try {
        const exercises = await mongoose.model('Exercise').find({ parent_assignment: this._id });
        for (const exercise of exercises) {
            await exercise.remove();
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);