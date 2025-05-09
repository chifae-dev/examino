const express = require('express');
const Exam = require('../models/exam');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('../middleware/auth');

// Route pour créer un examen
router.post('/', async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secretkey');
    const enseignantId = decoded.id;
    
    if (decoded.type !== 'enseignant') {
      return res.status(403).send('Accès refusé');
     }
    const { title, description, PublicCible } = req.body;

    // Générer un lien unique
    const examLink =  'http://localhost:3001/exam/' + Math.random().toString(36).substring(2, 15);

    // Créer un nouvel examen
    const newExam = new Exam({
      title,
      description,
      PublicCible,
      examLink,
      enseignant:  enseignantId,
    });

    await newExam.save();

    // Retourner un objet avec une clé claire et attendue par le frontend
    res.status(201).json({ 
      message: 'Examen enregistré', 
      examLink,
      examId: newExam._id,
      exam: newExam

    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la création de l\'examen');
  }
});
// Route pour lister les examens créés par l’enseignant connecté
router.get('/liste-examens', isAuthenticated, async (req, res) => {
  try {
    if (req.user.type !== 'enseignant') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const examens = await Exam.find({ enseignant: req.user._id });

    if (!examens.length) {
      return res.status(404).json({ message: 'Aucun examen trouvé.' });
    }

    res.json(examens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
