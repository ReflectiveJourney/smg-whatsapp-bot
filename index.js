// ============================================
// INDEX.JS — Point de démarrage du serveur
// Option A — Twilio
// ============================================
// Ce fichier lance le serveur Express qui écoute
// les messages WhatsApp envoyés par Twilio.

require('dotenv').config(); // Charge les variables secrètes du fichier .env
const express = require('express');
const webhook = require('./webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware : permet au serveur de lire les données envoyées par Twilio
// Twilio envoie les données en format "URL-encoded" (comme un formulaire web)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Route de test : pour vérifier que le serveur fonctionne
// Quand tu ouvres l'URL dans un navigateur, tu verras ce message
app.get('/', (req, res) => {
  res.send('Bot WhatsApp SMG est en ligne !');
});

// Route webhook : c'est ici que Twilio envoie les messages WhatsApp reçus
// Chaque fois qu'un client envoie un message, Twilio appelle cette URL
app.post('/webhook', webhook.recevoir);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur SMG démarré sur le port ${PORT}`);
  console.log(`Webhook URL : http://localhost:${PORT}/webhook`);
});
