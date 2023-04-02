const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, require: true },
    email: { type: String, require: false },
    password: { type: String, require: true },
    programming: [{ type: mongoose.Schema.Types.ObjectId, ref: "Programming" }],
    trainer: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coach" }],
    session: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    macros: [{ type: mongoose.Schema.Types.ObjectId, ref: "Macros" }],
    date: { type: Date, default: Date.now, required: true },
});
userSchema.index({ username: "text" });

module.exports = mongoose.model("User", userSchema);
