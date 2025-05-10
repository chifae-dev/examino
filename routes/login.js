console.log('✅ login.js loaded');
const express = require('express');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur'); // Le modèle Utilisateur
const router = express.Router();
router.get('/test', (req, res) => {
  res.send('Login route is active');
});

// Route de connexion
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      return res.status(400).send('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, utilisateur.password);
    if (!validPassword) {
      return res.status(400).send('Mot de passe incorrect');
    }
     
    // Générer un token JWT
    const token = jwt.sign(
      { id: utilisateur._id, email: utilisateur.email, type: utilisateur.type },
      'secretkey',  // clé secrète pour signer le token
      { expiresIn: '2h' }
    );

    // Déterminer la redirection selon le type d'utilisateur
     
    // Retourner le token et la redirection
    const redirect =
      utilisateur.type === 'enseignant' ? 'espace_enseignant/enseignant.html' : 'espace_etudiant/examen-etudiant.html';
      res.json({ token, redirect,  prenom: utilisateur.prenom} );
    
    
    // Retourner le token
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
