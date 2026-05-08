// ============================================
// INDEX.JS — Point de démarrage du serveur
// Meta WhatsApp Cloud API
// ============================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const webhook = require('./webhook');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour lire les données JSON envoyées par Meta
app.use(express.json());

// Servir les fichiers statiques (chat.html)
app.use(express.static(path.join(__dirname)));

// Route de test — redirige vers le chat de test
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Route de test du bot en local (sans WhatsApp)
app.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message || !userId) {
      return res.status(400).json({ error: 'message et userId requis' });
    }
    const reponse = await bot.traiterMessage(message, userId);
    res.json({ reponse });
  } catch (err) {
    console.error('Erreur /chat :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de vérification du webhook (Meta envoie un GET pour vérifier)
app.get('/webhook', webhook.verifier);

// Route webhook : Meta envoie les messages WhatsApp ici en POST
app.post('/webhook', webhook.recevoir);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur SMG démarré sur le port ${PORT}`);
  console.log(`Interface de test : http://localhost:${PORT}`);
  console.log(`Webhook URL      : http://localhost:${PORT}/webhook`);
});
