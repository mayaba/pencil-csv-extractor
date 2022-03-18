const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionscema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  annotation1: {
    type: String,
    required: true,
  },
  annotation2: {
    type: String,
    required: false,
  },
  annotation3: {
    type: String,
    required: false,
  },
  annotation4: {
    type: String,
    required: false,
  },
  annotation5: {
    type: String,
    required: false,
  },
});

const Question = mongoose.model('Question', questionscema);
module.exports = Question;
