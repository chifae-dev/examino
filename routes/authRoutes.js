const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 

// Route pour récupérer l'utilisateur connecté
router.get('/me', auth, (req, res) => {
  const utilisateur = req.user;
  res.json({
    id: utilisateur._id,
    nom: utilisateur.nom,
    email: utilisateur.email,
    role: utilisateur.type
  });
});

module.exports = router;