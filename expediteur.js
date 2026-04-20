// ============================================
// EXPEDITEUR.JS — Envoi des messages WhatsApp
// Meta WhatsApp Cloud API
// ============================================

const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Envoie un message WhatsApp à un numéro donné
async function envoyerMessage(numeroDestinataire, texte) {
  try {
    const MAX_LONGUEUR = 4000;

    if (texte.length <= MAX_LONGUEUR) {
      await envoyerMessageAPI(numeroDestinataire, texte);
    } else {
      const parties = decouperMessage(texte, MAX_LONGUEUR);
      for (const partie of parties) {
        await envoyerMessageAPI(numeroDestinataire, partie);
      }
    }

    console.log(`Message envoyé à ${numeroDestinataire}`);
  } catch (erreur) {
    console.error(`Erreur envoi message à ${numeroDestinataire} :`, erreur.response?.data || erreur.message);
    throw erreur;
  }
}

// Appel direct à l'API Meta WhatsApp
async function envoyerMessageAPI(numero, texte) {
  await axios.post(
    WHATSAPP_API_URL,
    {
      messaging_product: 'whatsapp',
      to: numero,
      type: 'text',
      text: { body: texte },
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Envoie un message WhatsApp à l'admin SMG
async function envoyerMessageAdmin(texte) {
  const NUMERO_ADMIN = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!NUMERO_ADMIN) {
    console.error('Numéro admin non configuré dans .env');
    return;
  }

  try {
    await envoyerMessageAPI(NUMERO_ADMIN, texte);
    console.log("Message d'alerte envoyé à l'admin");
  } catch (erreur) {
    console.error('Erreur envoi message admin :', erreur.response?.data || erreur.message);
  }
}

// Découpe un message long en plusieurs parties
function decouperMessage(texte, maxLongueur) {
  const parties = [];
  let restant = texte;

  while (restant.length > 0) {
    if (restant.length <= maxLongueur) {
      parties.push(restant);
      break;
    }

    let coupure = restant.lastIndexOf('\n', maxLongueur);
    if (coupure === -1 || coupure < maxLongueur / 2) {
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
