const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3001;
const path = require('path');
const jwt = require('jsonwebtoken'); //JWT

// Connexion MongoDB
mongoose.connect('mongodb://admin:1234@localhost:27017/', {})
  .then(() => console.log('MongoDB connecté'))
  .catch(console.error);

app.use(cors());
app.use(express.json());
const inscriptionRoute = require('./routes/inscription')
app.use('/api/inscription', inscriptionRoute);


const loginRoute = require('./routes/login'); // Importer la route de connexion
app.use('/api/login', loginRoute);  // Ajouter la route de connexion


const examRoute = require('./routes/exams'); //  Importer la route de création d'examen
app.use('/api/exams', examRoute); // Ajouter la route de création d'examen

app.use(express.static(path.join(__dirname)));





app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
  //res.sendFile(path.join(__dirname, 'login.html'));//
})



app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
