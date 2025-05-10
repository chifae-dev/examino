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
     // Créer un nouvel examen
    const newExam = new Exam({
      title,
      description,
      PublicCible,
      enseignant:  enseignantId,
    });
    await newExam.save();
    // Générer un lien unique
    const examLink = `http://localhost:3001/espace_etudiant/examen-etudiant.html?examId=${newExam._id}`;
    newExam.examLink = examLink;
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
// Route pour récupérer un examen spécifique par son ID
router.get('/exam/:examId', isAuthenticated, async (req, res) => {
  try {
    const examId = req.params.examId; // Récupération de l'ID de l'examen depuis les paramètres de l'URL
    const user = req.user;  

    // Recherche de l'examen par son Id de la liste des questions associées
    const exam = await Exam.findById(examId).populate('questions');  

    if (!exam) {
      return res.status(404).send('Examen non trouvé');
    }

    // Si l'utilisateur est un étudiant, vérifier s'il est inscrit à cet examen
    if (user.type === 'etudiant') {
      if (!exam.students.includes(user.id)) {
        return res.status(403).send('Accès interdit à cet examen');
      }
    }

    // Si l'utilisateur est un enseignant, lui permettre d'accéder à tous les examens qu'il a créés
    if (user.type === 'enseignant') {
      if (String(exam.enseignant) !== String(user.id)) {
        return res.status(403).send('Accès interdit à cet examen'); // Si l'enseignant essaie d'accéder à un examen qu'il n'a pas créé, renvoyer une erreur 403
      
      }
    }

    res.json(exam); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;

