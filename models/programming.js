const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const programmingSchema = new Schema ({
    cycleName: { type: String, require: true },
    weeks: [{ type: mongoose.Schema.Types.ObjectId, ref: "WeekDay" }],
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    athlete: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
})

programmingSchema.index({ cycleName: "text" });

module.exports = mongoose.model("Programming", programmingSchema);



// const programmingSchema = new Schema({
//     cycleName: { type: String, require: true },
//     date: { type: Date, default: Date.now, required: true },
//     weeks: [
//         {
//             weekNumber: { type: Number, require: true },
//             days: [
//                 {
//                     dayNumber: { type: Number, require: true },
//                     session: [
//                         {
//                             exercise: {
//                                 type: String,
//                                 require: true,
//                                 unique: false,
//                             },
//                             conditioning: {
//                                 type: String,
//                                 require: true,
//                                 unique: false,
//                             },
//                             reps: { type: Number, require: false },
//                             rounds: { type: Number, require: false },
//                             weight: { type: Number, require: false },
//                             distance: { type: String, require: false },
//                             time: { type: String, require: false },
//                         },
//                     ],
//                 },
//             ],
//         },
//     ],
//     athlete: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Coach" },
// });