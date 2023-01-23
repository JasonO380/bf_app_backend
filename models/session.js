const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema ({
    exercise:{type: String, require: true, unique: false},
    conditioning: {type: String, require: true, unique: false},
    date: {type: Date, default: Date.now, required: true},
    session: [{
        reps: {type: Number, require: false},
        rounds: {type: Number, require: false},
        weight: {type: Number, require: false},
        distance:{type: String, require: false},
        time:{type: String, require: false},
    }],
    athlete: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    trainer: {type: mongoose.Schema.Types.ObjectId, ref: 'Coach'}
});

module.exports = mongoose.model('Session', sessionSchema);