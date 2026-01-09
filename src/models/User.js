const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, index: true, immutable: true },
    password_hash: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ["student", "coach", "admin"], default: "student" }
}, { timestamps: true });

UserSchema.pre("save", async function () {
    if (this.isModified("password_hash")) this.password_hash = await bcrypt.hash(this.password_hash, 10);
});

UserSchema.pre("remove", async function (next) {
    try {
        if (this.role === 'student') {
            const StudentGroup = mongoose.model('StudentGroup');
            const StudentExercise = mongoose.model('StudentExercise');
            const Following = mongoose.model('Following');
            const Challenge = mongoose.model('Challenge');
            const CFAccount = mongoose.model('CFAccount');
            await StudentGroup.deleteMany({ student_id: this._id });
            await StudentExercise.deleteMany({ student_id: this._id });
            await Following.deleteMany({ student_1_id: this._id });
            await Following.deleteMany({ student_2_id: this._id });
            await Challenge.deleteMany({ student_id: this._id });
            await CFAccount.deleteMany({ student_id: this._id });
        } else if (this.role === 'coach') {
            const Group = mongoose.model('Group');
            const groups = await Group.find({ parent_creator: this._id });
            for (const group of groups) await group.remove();
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("User", UserSchema);
