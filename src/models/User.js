const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ["student", "coach", "admin"], default: "student" },
    child_groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password_hash")) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
});

module.exports = mongoose.model("User", UserSchema);
