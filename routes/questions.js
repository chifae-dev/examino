const express = require('express');
const multer = require('multer'); // Pour gérer l'envoi de fichiers
const path = require('path');
const Question = require('../models/question');
const { console } = require('inspector');
const router = express.Router();

//____________ Ajouter une question ___________//
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
    const { type, enonce, options, bonnesReponses, reponse, tolerance, duree, note,  examId } = req.body;
    const media = req.file ? req.file.filename : null;

    const questionData = {
      type,
      enonce,
      media,
      duree, // Durée de la question (en secondes)
      note,   // Note attribuée à la question
      examen: examId
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

    // Enregistrer la question dans la base de données
    const question = new Question(questionData);
    await question.save();

    res.status(201).json({ message: `Question ${type} ajoutée avec succès.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
  }

}); 

//____________ Lister les questions d’un examen ___________//
router.get('/exams/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = await Question.find({ examen: examId });
    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du chargement des questions.' });
  }
});

// _____________Modifier une question__________//
router.put('/:id', upload.single('media'), async (req, res) => {
  console.log("Route PUT /questions/:id atteinte");
  try {
    const questionId = req.params.id;
    const { enonce, options, bonnesReponses, reponse, tolerance, duree, note } = req.body;
    const media = req.file ? req.file.filename : undefined;
    console.log('ID Question:', questionId);
    const updatedData = {
      enonce,
      duree,
      note,
    };

    if (media) updatedData.media = media;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question introuvable.' });
    // modefication spécifique selon le type
    if (question.type === 'qcm') {
      updatedData.options = JSON.parse(options);
      updatedData.bonnesReponses = JSON.parse(bonnesReponses);
    } else if (question.type === 'directe') {
      updatedData.reponse = reponse;
      updatedData.tolerance = tolerance ? Number(tolerance) : 0;
    }
    // modefiction dans la base
    await Question.findByIdAndUpdate(questionId, updatedData);
    res.status(200).json({ message: 'Question mise à jour avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
});

//____________Supprimer une question__________ //
router.delete('/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted) {
      return res.status(404).json({ message: 'Question non trouvée.' });
    }
    res.status(200).json({ message: 'Question supprimée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question non trouvée.' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la question.' });
  }
});

module.exports = router;
