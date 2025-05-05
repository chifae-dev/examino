const express = require('express');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password, nom, prenom, dateNaissance, sexe, etablissement, filiere, type } = req.body;

    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) return res.status(400).send('Utilisateur déjà inscrit');

    const hash = await bcrypt.hash(password, 10);

    const utilisateur = new Utilisateur({
      email,
      password: hash,
      nom,
      prenom,
      dateNaissance,
      sexe,
      etablissement,
      filiere,
      type
    });

    await utilisateur.save();
    res.status(201).send('Inscription réussie');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
