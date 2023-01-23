const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programmingSchema = new Schema ({
    cycleName: {type: String, require: true},
    date: {type: Date, default: Date.now, required: true},
    weeks: [{
        weekNumber: {type: Number, require: true},
        days: [{
            dayNumber: {type: Number, require: true},
            session: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Session'
            }]
        }]
    }],
    athlete: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    trainer: {type: mongoose.Schema.Types.ObjectId, ref: 'Coach'}
});
programmingSchema.index({ cycleName: 'text' });

module.exports = mongoose.model('Programming', programmingSchema);