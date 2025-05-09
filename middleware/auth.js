/**
 * Middleware d'authentification JWT
 * Ce middleware vérifie que la requête contient un token JWT valide dans l'en-tête "Authorization".
 */


const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur'); 

module.exports = async function (req, res, next) {
   // Récupération de l'en-tête Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé (aucun token)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'secretkey'); 


    // récupération de l'utilisateur depuis l'ID contenu dans le token
    const utilisateur = await Utilisateur.findById(decoded.id);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    req.user = utilisateur; // injecte l'utilisateur dans la requête
    next(); // passe au middleware suivant ou à la route
  } catch (err) {
    console.error('Erreur de vérification du token :', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
};
