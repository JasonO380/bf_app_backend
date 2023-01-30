const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, require: true },
    email: { type: String, require: false },
    password: { type: String, require: true },
    programming: [{ type: mongoose.Schema.Types.ObjectId, ref: "Programming" }],
    trainer: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coach" }],
    session: [
        {
            exercise: { type: String, require: true, unique: false },
            conditioning: { type: String, require: true, unique: false },
            date: { type: Date, default: Date.now, required: true },
            reps: { type: Number, require: false },
            rounds: { type: Number, require: false },
            weight: { type: Number, require: false },
            distance: { type: String, require: false },
            time: { type: String, require: false },
        },
    ],
    date: { type: Date, default: Date.now, required: true },
});
userSchema.index({ username: "text" });

module.exports = mongoose.model("User", userSchema);
