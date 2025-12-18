const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignmentSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    due_date: { type: Date, required: false },
    exercises: [{
        title: { type: String, required: true },
        points: { type: Number, required: true },
        /*
        codeforces
        - https://codeforces.com/problemset/problem/1338/C
        Store as "1338/C"
        */
        problem_id: { type: String, required: true, unique: true},
    }],
    student_progress: [{ 
        student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        completed_exercises: [{ type: String }]
    }]
});

module.exports = mongoose.model('Assignment', AssignmentSchema);