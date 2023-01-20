const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programmingSchema = new Schema ({
    cycleName: {type: String, require: true},
    trainer: {type: mongoose.Schema.Types.ObjectId, ref: 'Trainer'},
    workouts: {type: mongoose.Schema.Types.ObjectId, ref:'Workout'}
});

module.exports = mongoose.model('Programming', programmingSchema);