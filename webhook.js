// ============================================
// WEBHOOK.JS — Réception des messages WhatsApp
// Option A — Twilio
// ============================================
// Ce fichier reçoit les messages envoyés par les clients sur WhatsApp.
// Twilio intercepte le message et l'envoie ici automatiquement.

const bot = require('./bot');
const expediteur = require('./expediteur');

async function recevoir(req, res) {
  try {
    // Twilio envoie les infos du message dans req.body
    // "Body" = le texte du message, "From" = le numéro du client
    const messageClient = req.body.Body;
    const numeroClient = req.body.From; // Format : whatsapp:+225XXXXXXXXXX

    // Si le message est vide, on ignore
    if (!messageClient || !numeroClient) {
      return res.status(200).send('OK');
    }

    console.log(`Message reçu de ${numeroClient} : ${messageClient}`);

    // On envoie le message au cerveau du bot pour qu'il trouve la bonne réponse
    const reponse = await bot.traiterMessage(messageClient, numeroClient);

    // On envoie la réponse au client via WhatsApp
    await expediteur.envoyerMessage(numeroClient, reponse);

    console.log(`Réponse envoyée à ${numeroClient}`);

    // On répond à Twilio avec un status 200 (= tout s'est bien passé)
    // Si on ne répond pas, Twilio va croire qu'il y a eu une erreur
    res.status(200).send('OK');

  } catch (erreur) {
    console.error('Erreur dans le webhook :', erreur.message);
    // Même en cas d'erreur, on répond 200 à Twilio pour éviter qu'il renvoie le message en boucle
    res.status(200).send('OK');
  }
}

module.exports = { recevoir };
