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
    const { type, enonce, options, bonnesReponses } = req.body;


    let parsedOptions, parsedBonnesReponses;

    try {
      parsedOptions = JSON.parse(options);
      parsedBonnesReponses = JSON.parse(bonnesReponses);
    } catch (err) {
      return res.status(400).json({ message: 'Options ou bonnes réponses mal formatées.' });
    }

    // Vérification des champs obligatoires
    if (!enonce || !Array.isArray(parsedOptions) || !Array.isArray(parsedBonnesReponses)) {
      return res.status(400).json({ message: 'Champs requis manquants ou invalides.' });
    }

    if (parsedOptions.length === 1) {
      return res.status(400).json({ message: 'Veuillez ajouter au moins deux options.' });
    }

    if (parsedBonnesReponses.length === 0) {
      return res.status(400).json({ message: 'Merci de choisir au moins une bonne réponse' });
    }

    const question = new Question({
      type,
      enonce,
      media: req.file ? req.file.filename : null,
      options: parsedOptions,
      bonnesReponses: parsedBonnesReponses
    });

    await question.save();

    res.status(201).json({ message: 'Question QCM ajoutée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

module.exports = router;
