const mongoose = require('mongoose');
const { Schema } = mongoose;

const LogSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, required: true, trim: true, },
    username: { type: String, required: true, trim: true, },
    email: { type: String, required: true, trim: true, },
    action: { type: String, required: true },
    detail: { type: String, required: false },
    model: { type: String, required: true },
    document_id: { type: String, required: true }
  }, {
    timestamps: true,
});

module.exports = mongoose.model('Log', LogSchema);