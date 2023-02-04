const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema ({
    clientName: {type: String, require: true},
    programming: [{type: mongoose.Schema.Types.ObjectId, ref: 'Programming'}],
    session: [{type:mongoose.Schema.Types.ObjectId, ref : 'Session'}],
    coach: [{type:mongoose.Schema.Types.ObjectId, ref : 'Coach'}],
});
clientSchema.index({ clientName: 'text' });

module.exports = mongoose.model('Client', clientSchema);