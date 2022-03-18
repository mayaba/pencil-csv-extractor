const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicscema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  topiclist: {
    type: Array,
    required: true,
  },
});

const Topic = mongoose.model('Topic', topicscema);
module.exports = Topic;
