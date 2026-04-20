// ============================================
// INDEX.JS — Point de démarrage du serveur
// Meta WhatsApp Cloud API
// ============================================

require('dotenv').config();
const express = require('express');
const webhook = require('./webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire les données JSON envoyées par Meta
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('Bot WhatsApp SMG est en ligne !');
});

// Route de vérification du webhook (Meta envoie un GET pour vérifier)
app.get('/webhook', webhook.verifier);

// Route webhook : Meta envoie les messages WhatsApp ici en POST
app.post('/webhook', webhook.recevoir);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur SMG démarré sur le port ${PORT}`);
  console.log(`Webhook URL : http://localhost:${PORT}/webhook`);
});
