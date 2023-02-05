const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movementSchema = new Schema({
    movement: { type: String, require: true, unique: false },
    date: { type: Date, default: Date.now, required: true },
});
movementSchema.index({ movement: "text" });

module.exports = mongoose.model("Movement", movementSchema);
