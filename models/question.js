const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['qcm'],
    required: true
  },
  enonce: {
    type: String,
    required: true
  },
  media: {
    type: String,
    default: null
  },
  options: {
    type: [String],
    required: true
  },
  bonnesReponses: {
    type: [Number],
    required: true
  }
});

module.exports = mongoose.model('Question', questionSchema);
