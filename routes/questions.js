const express = require('express');
const multer = require('multer'); // Pour gérer l'envoi de fichiers
const path = require('path');
const Question = require('../models/question');

const router = express.Router();

//Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),  // dossier où multer stocke les fichiers
  
  // Nom de fichier personnalisé : timestamp + extension
  filename: (req, file, cb) => {
    const uniqueName = Date.now()+ path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
// Initialisation de multer avec le stockage défini
const upload = multer({ storage });
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { type, enonce, options, bonnesReponses, reponse, tolerance } = req.body;

    const media = req.file ? req.file.filename : null;

    const questionData = {
      type,
      enonce,
      media
    };
    // appliquer une condition pour gèrer les champs spécifiques à chaque type
    
    if (type === 'qcm') {
      let parsedOptions, parsedBonnesReponses;

      try {
        parsedOptions = JSON.parse(options);
        parsedBonnesReponses = JSON.parse(bonnesReponses);
      } catch (err) {
        return res.status(400).json({ message: 'Options ou bonnes réponses mal formatées.' });
      }

      // On vérifie que les champs obligatoires sont bien présents et valides
      if (!enonce || !Array.isArray(parsedOptions) || !Array.isArray(parsedBonnesReponses)) {
        return res.status(400).json({ message: 'Champs requis manquants ou invalides.' });
      }

      if (parsedOptions.length === 1) {
        return res.status(400).json({ message: 'Veuillez ajouter au moins deux options.' });
      }

      if (parsedBonnesReponses.length === 0) {
        return res.status(400).json({ message: 'Merci de choisir au moins une bonne réponse' });
      }
      // Si tout est valide, on ajoute les options et bonnes réponses à l'objet
      questionData.options = parsedOptions;
      questionData.bonnesReponses = parsedBonnesReponses;
    }

    if (type === 'directe') {
      if (!enonce || !reponse) {
        return res.status(400).json({ message: 'Enoncé et réponse requis pour la question directe.' });
      }
      
      // Si un taux de tolérance est fourni, on le convertit en nombre
      // Sinon, la tolérance est à 0 par défaut
      questionData.reponse = reponse;
      questionData.tolerance = tolerance ? Number(tolerance) : 0;
    }

    const question = new Question(questionData);
    await question.save();

    res.status(201).json({ message: `Question ${type} ajoutée avec succès.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
  }
});
module.exports = router;
