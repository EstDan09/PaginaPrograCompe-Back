const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
    name: { type: String, required: true },
    description : { type: String, required: false },
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }]
});

module.exports = mongoose.model('Group', GroupSchema);