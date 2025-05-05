const express = require('express');
const Exam = require('../models/exam');
const router = express.Router();

// Route pour créer un examen
router.post('/', async (req, res) => {
  try {
    const { title, description, PublicCible } = req.body;

    // Générer un lien unique
    const examLink = 'http://localhost:3001/exam/' + Math.random().toString(36).substring(2, 15);

    // Créer un nouvel examen
    const newExam = new Exam({
      title,
      description,
      PublicCible,
      examLink
    });

    await newExam.save();

    // Retourner un objet avec une clé claire et attendue par le frontend
    res.status(201).json({ message: 'Examen enregistré', examLink });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la création de l\'examen');
  }
});

module.exports = router;
