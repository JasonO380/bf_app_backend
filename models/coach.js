const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coachSchema = new Schema({
    coachName: { type: String, require: true },
    email: { type: String, require: false },
    password: { type: String, require: true },
    programming: [{ type: mongoose.Schema.Types.ObjectId, ref: "Programming" }],
    athlete: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    client: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
});
coachSchema.index({ coachName: "text" });

module.exports = mongoose.model("Coach", coachSchema);
