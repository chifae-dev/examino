const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['qcm','directe'],//+type directe
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
  },
  bonnesReponses: {
    type: [Number],
  },
  // Champs spécifiques à la question directe
  reponse: {
    type: String
  },
  tolerance: {
    type: Number // en pourcentage (ex: 10)
  } ,
  // Durée de la question en secondes
  duree: {
    type: Number, // en secondes
    required: true
  },
  // Note de la question
  note: {
    type: Number,
    required: true
  }
}) 

module.exports = mongoose.model('Question', questionSchema);
