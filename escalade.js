// ============================================
// ESCALADE.JS — Transfert vers l'admin SMG
// Option A — Twilio
// ============================================
// Ce fichier gère le transfert vers un humain quand :
// - Le bot ne comprend pas le client après 3 tentatives
// - Le client demande explicitement à parler à un humain
// - La demande dépasse les capacités du bot
//
// Actions : envoi WhatsApp à l'admin
// (Email désactivé — peut être réactivé en remplissant les champs SMTP dans .env)

const expediteur = require('./expediteur');
const nodemailer = require('nodemailer');

// Fonction principale : transfère la demande à l'admin
async function transfererAdmin(numeroClient, dernierMessage, historique, raison) {
  console.log(`\n🚨 ESCALADE — Raison : ${raison}`);
  console.log(`Client : ${numeroClient}`);

  // Préparer le résumé des derniers messages
  const resumeHistorique = preparerResume(historique);

  // Lancer les deux notifications en parallèle (simultanément)
  // Promise.allSettled attend que les deux soient terminées,
  // même si l'une des deux échoue
  await Promise.allSettled([
    envoyerAlertWhatsApp(numeroClient, dernierMessage, resumeHistorique, raison),
    envoyerAlertEmail(numeroClient, dernierMessage, resumeHistorique, raison),
  ]);
}

// ── ALERTE WHATSAPP À L'ADMIN ──
async function envoyerAlertWhatsApp(numeroClient, dernierMessage, resume, raison) {
  const message =
    `🚨 *ALERTE SMG — Escalade client*\n\n` +
    `*Raison :* ${raison}\n` +
    `*Client :* ${numeroClient}\n` +
    `*Dernier message :* ${dernierMessage}\n\n` +
    `*Historique récent :*\n${resume}\n\n` +
    `Merci de contacter le client dans les 30 minutes.`;

  await expediteur.envoyerMessageAdmin(message);
}

// ── ALERTE EMAIL À L'ADMIN (optionnelle) ──
async function envoyerAlertEmail(numeroClient, dernierMessage, resume, raison) {
  // Vérifier que les paramètres email sont configurés
  // Si les champs sont vides dans .env, on ne tente pas d'envoyer d'email
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) {
    console.log('Email désactivé — champs SMTP non configurés dans .env');
    return;
  }

  try {
    // Créer le "transporteur" email (l'outil qui envoie les emails)
    const transporteur = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true pour le port 465, false pour les autres
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Contenu de l'email en HTML (beau format pour l'admin)
    const contenuHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e74c3c; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 Escalade Client — SMG Bot</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>Raison :</strong> ${raison}</p>
          <p><strong>Numéro client :</strong> ${numeroClient}</p>
          <p><strong>Dernier message :</strong> ${dernierMessage}</p>
          <hr style="border: 1px solid #eee;">
          <h3>Historique récent :</h3>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${resume}</pre>
          <hr style="border: 1px solid #eee;">
          <p style="color: #e74c3c;"><strong>⏰ Merci de contacter le client dans les 30 minutes.</strong></p>
        </div>
      </div>
    `;

    // Envoyer l'email
    await transporteur.sendMail({
      from: `"SMG Bot" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 Escalade client — ${raison}`,
      html: contenuHTML,
    });

    console.log('Email d\'escalade envoyé à l\'admin');
  } catch (erreur) {
    console.error('Erreur envoi email :', erreur.message);
    // On ne relance pas l'erreur car l'alerte WhatsApp est suffisante
  }
}

// ── PRÉPARER LE RÉSUMÉ DES MESSAGES ──
// Formate les 5 derniers messages de la conversation
function preparerResume(historique) {
  if (!historique || historique.length === 0) {
    return 'Aucun historique disponible.';
  }

  // Garder les 5 derniers messages maximum
  const derniers = historique.slice(-5);

  return derniers
    .map((msg) => {
      const qui = msg.role === 'user' ? '👤 Client' : '🤖 Bot';
      return `${qui} : ${msg.content}`;
    })
    .join('\n\n');
}

module.exports = { transfererAdmin };
