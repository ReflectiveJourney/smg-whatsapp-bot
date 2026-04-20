// ============================================
// WEBHOOK.JS — Réception des messages WhatsApp
// Meta WhatsApp Cloud API
// ============================================

const bot = require('./bot');
const expediteur = require('./expediteur');

// Vérification du webhook par Meta (appelé une seule fois lors de la config)
function verifier(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('Webhook vérifié par Meta !');
    return res.status(200).send(challenge);
  }

  console.error('Échec de vérification du webhook');
  return res.sendStatus(403);
}

// Réception des messages WhatsApp
async function recevoir(req, res) {
  try {
    // Répondre immédiatement à Meta (évite les timeouts et les renvois)
    res.sendStatus(200);

    const body = req.body;

    // Vérifier que c'est bien un message WhatsApp
    if (
      !body.object ||
      !body.entry ||
      !body.entry[0].changes ||
      !body.entry[0].changes[0].value.messages
    ) {
      return;
    }

    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];

    // On ne traite que les messages texte
    if (message.type !== 'text') {
      return;
    }

    const messageClient = message.text.body;
    const numeroClient = message.from; // Format : 225XXXXXXXXXX (sans +)

    if (!messageClient || !numeroClient) {
      return;
    }

    console.log(`Message reçu de ${numeroClient} : ${messageClient}`);

    // Envoyer le message au cerveau du bot
    const reponse = await bot.traiterMessage(messageClient, numeroClient);

    // Envoyer la réponse au client via WhatsApp
    await expediteur.envoyerMessage(numeroClient, reponse);

    console.log(`Réponse envoyée à ${numeroClient}`);
  } catch (erreur) {
    console.error('Erreur dans le webhook :', erreur.message);
  }
}

module.exports = { verifier, recevoir };
