// ============================================
// EXPEDITEUR.JS — Envoi des messages WhatsApp
// Option A — Twilio
// ============================================
// Ce fichier envoie les réponses du bot au client via WhatsApp
// en utilisant le SDK Twilio (bibliothèque officielle Twilio).

const twilio = require('twilio');

// Création du client Twilio avec les identifiants du fichier .env
// Le "client" est l'outil qui permet de communiquer avec Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Le numéro WhatsApp du bot (le numéro du Sandbox Twilio)
const NUMERO_BOT = process.env.TWILIO_WHATSAPP_NUMBER;

// Envoie un message WhatsApp à un numéro donné
async function envoyerMessage(numeroDestinataire, texte) {
  try {
    // WhatsApp a une limite de ~4096 caractères par message
    // Si le message est trop long, on le découpe en plusieurs parties
    const MAX_LONGUEUR = 4000;

    if (texte.length <= MAX_LONGUEUR) {
      // Message court : on envoie directement
      await client.messages.create({
        body: texte,
        from: NUMERO_BOT,
        to: numeroDestinataire,
      });
    } else {
      // Message long : on découpe et envoie en plusieurs parties
      const parties = decouperMessage(texte, MAX_LONGUEUR);
      for (const partie of parties) {
        await client.messages.create({
          body: partie,
          from: NUMERO_BOT,
          to: numeroDestinataire,
        });
      }
    }

    console.log(`Message envoyé à ${numeroDestinataire}`);
  } catch (erreur) {
    console.error(`Erreur envoi message à ${numeroDestinataire} :`, erreur.message);
    throw erreur;
  }
}

// Envoie un message WhatsApp à l'admin SMG
// Utilisé par le module d'escalade pour alerter l'admin
async function envoyerMessageAdmin(texte) {
  const NUMERO_ADMIN = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!NUMERO_ADMIN) {
    console.error('Numéro admin non configuré dans .env');
    return;
  }

  try {
    await client.messages.create({
      body: texte,
      from: NUMERO_BOT,
      to: NUMERO_ADMIN,
    });
    console.log('Message d\'alerte envoyé à l\'admin');
  } catch (erreur) {
    console.error('Erreur envoi message admin :', erreur.message);
  }
}

// Découpe un message long en plusieurs parties
// en essayant de couper à un saut de ligne plutôt qu'au milieu d'un mot
function decouperMessage(texte, maxLongueur) {
  const parties = [];
  let restant = texte;

  while (restant.length > 0) {
    if (restant.length <= maxLongueur) {
      parties.push(restant);
      break;
    }

    // Chercher le dernier saut de ligne avant la limite
    let coupure = restant.lastIndexOf('\n', maxLongueur);
    if (coupure === -1 || coupure < maxLongueur / 2) {
      // Si pas de saut de ligne, couper au dernier espace
      coupure = restant.lastIndexOf(' ', maxLongueur);
    }
    if (coupure === -1) {
      coupure = maxLongueur;
    }

    parties.push(restant.substring(0, coupure));
    restant = restant.substring(coupure).trim();
  }

  return parties;
}

module.exports = { envoyerMessage, envoyerMessageAdmin };
