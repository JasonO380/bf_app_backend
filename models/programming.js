const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const programmingSchema = new Schema({
    cycleName: { type: String, require: true },
    cycleAPI: { type: String},
    weeks: [{ type: mongoose.Schema.Types.ObjectId, ref: "WeekDay" }],
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    athlete: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
});

programmingSchema.index({ cycleName: "text" });

module.exports = mongoose.model("Programming", programmingSchema);

