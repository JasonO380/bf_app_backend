const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const macroSchema = new Schema ({
    year: { type: Number, required: false },
    month: { type: String, required: false },
    dayOfMonth: { type: Number, required: false },
    dayOfWeek: { type: String, required: false },
    carbs: { type: Number, required: true },
    protein: { type: Number, required: true },
    fats: { type: Number, required: true },
    athlete: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Macros", macroSchema);


//   "year": 2023,
//   "month": "April",
//   "dayOfMonth": 2,
//   "dayOfWeek": "Sunday",
//   "athlete": "63e0fffedfdf8d9d1382cb54"