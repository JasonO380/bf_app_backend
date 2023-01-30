const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weekDaySchema = new Schema ({
    weekNumber: { type: Number, require: true },
    day: { type: String, require: true },
    session: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    programming: [{ type: mongoose.Schema.Types.ObjectId, ref: "Programming" }]
})

module.exports = mongoose.model("WeekDay", weekDaySchema);