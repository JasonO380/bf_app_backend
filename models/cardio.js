const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardioSchema = new Schema ({
    type: {type: String, require: false},
    distance:{type: String, require: false},
    time:{type: String, require: false},
    date: {type: Date, default: Date.now, required: true}
})
cardioSchema.index({ type: 'text' });

module.exports = mongoose.model('Cardio', cardioSchema);