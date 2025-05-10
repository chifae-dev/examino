const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  PublicCible: { type: String, required: true },
  examLink: { type: String, unique: true},
  enseignant: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true }
});

module.exports = mongoose.model('Exam', examSchema);
