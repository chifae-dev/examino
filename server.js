const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3001;
const path = require('path');


// Connexion MongoDB
mongoose.connect('mongodb://admin:1234@localhost:27017/', {})
  .then(() => console.log('MongoDB connecté'))
  .catch(console.error);

app.use(cors());
app.use(express.json());
const inscriptionRoute = require('./routes/inscription')
app.use('/api/inscription', inscriptionRoute);



app.use(express.static(path.join(__dirname)));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
  res.sendFile(path.join(__dirname, 'login.html'));
});



app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
