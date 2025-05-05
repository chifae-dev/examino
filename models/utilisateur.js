const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nom: String,
  prenom: String,
  dateNaissance: Date,
  sexe: String,
  etablissement: String,
  filiere: String,
  type: { type: String, enum: ['etudiant', 'enseignant'], required: true }
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
