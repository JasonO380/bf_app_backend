const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username: {type: String, require: true},
    email:{type: String, require: false},
    password:{type: String, require: true},
    programming: {type: mongoose.Schema.Types.ObjectId, ref: 'Programming'},
    trainer: {type: mongoose.Schema.Types.ObjectId, ref: 'Trainer'},
    workouts: {type: mongoose.Schema.Types.ObjectId, ref:'Workout'}
})