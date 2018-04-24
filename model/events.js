var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventsSchema = new Schema({
  name: String,
  hashtag: String,
  posts:[]
});

module.exports = mongoose.model('Event', EventsSchema);
