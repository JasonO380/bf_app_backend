const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const date = new Date ()

const sessionSchema = new Schema({
    exercise: { type: String, required: true },
    date: { type: Date, default: (new Date()).toDateString(), required: true },
    reps: { type: Number, required: false },
    rounds: { type: Number, required: false },
    weight: { type: Number, required: false },
    distance: { type: String, require: false },
    time: { type: String, require: false },
    year: { type: Number, required: false },
    month: { type: String, required: false },
    dayOfMonth: { type: Number, required: false },
    dayOfWeek: { type: String, required: false },
    athlete: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
    programming: [{ type: mongoose.Schema.Types.ObjectId, ref: "Programming" }],
    weekDays: [{ type: mongoose.Schema.Types.ObjectId, ref: "WeekDay" }],
});

sessionSchema.pre("save", function(next) {
    this.exercise = this.exercise.charAt(0).toUpperCase() + this.exercise.slice(1).toLowerCase();
    next();
});

module.exports = mongoose.model("Session", sessionSchema);
