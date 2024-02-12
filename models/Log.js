const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({

  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  log: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Log = mongoose.model('log', LogSchema);

