const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
    name: { type: String, required: true },
    description : { type: String, required: false },
    parent_creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
});

GroupSchema.pre('remove', async function(next) {
    try {
        const assignments = await mongoose.model('Assignment').find({ parent_group: this._id });
        for (const assignment of assignments) await assignment.remove();
        await mongoose.model('StudentGroup').deleteMany({ group_id: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Group', GroupSchema);