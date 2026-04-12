// ============================================
// REPONSES.JS — Modules de réponses par domaine
// Option A — Twilio
// ============================================
// Ce fichier contient toutes les réponses pré-formatées du bot.
// Chaque fonction génère un message WhatsApp pour un sujet précis.
// Formatage WhatsApp : *gras*, _italique_, listes avec tirets
// Supporte la navigation par chiffre ET par texte libre.

const voyages = require('./voyages.json');
const connaissances = require('./connaissances.json');

// ── SALUTATION / MENU PRINCIPAL ──
// Affiché au premier message, quand le client tape "menu", "aide" ou "0"
function salutation() {
  return (
    `*Bienvenue chez SMG Voyages !* ✈️🌍\n\n` +
    `Je suis votre assistant virtuel. Tapez un *chiffre* ou écrivez votre demande :\n\n` +
    `1️⃣ *Destinations* — Découvrir où voyager\n` +
    `2️⃣ *Prix* — Connaître nos tarifs\n` +
    `3️⃣ *Réserver* — Démarrer une réservation\n` +
    `4️⃣ *Suivi dossier* — Suivre votre réservation\n` +
    `5️⃣ *FAQ* — Visa, bagages, assurance\n` +
    `0️⃣ *Conseiller* — Parler à un humain\n\n` +
    `Que puis-je faire pour vous ? 😊`
  );
}

// ── MINI MENU ──
// Ajouté à la fin de chaque réponse pour guider le client
function miniMenu() {
  return (
    `\n\n---\n` +
    `Tapez un chiffre ou écrivez votre demande. Répondez *menu* pour revoir les options.`
  );
}

// ── MENU FAQ ──
// Affiché quand le client tape "5" ou "faq"
function faqMenu() {
  return (
    `*❓ FAQ — Questions fréquentes*\n\n` +
    `Choisissez un sujet :\n\n` +
    `1️⃣ *Visa* — Infos visa par destination\n` +
    `2️⃣ *Bagages* — Poids et dimensions autorisés\n` +
    `3️⃣ *Assurance* — Couverture voyage\n` +
    `4️⃣ *Annulation* — Conditions de remboursement\n` +
    `5️⃣ *Paiement* — Modes de paiement acceptés\n\n` +
    `Tapez le sujet qui vous intéresse ou répondez *menu* pour revenir au menu principal.`
  );
}

// ── DISPONIBILITÉ D'UNE DESTINATION SPÉCIFIQUE ──
function disponibiliteDestination(destinationId) {
  const dest = voyages.destinations.find((d) => d.id === destinationId);

  if (!dest) {
    return `Je n'ai pas trouvé cette destination. Tapez *1* ou *"destinations"* pour voir la liste complète.`;
  }

  let message = `*📅 Disponibilité — ${dest.nom}*\n\n`;

  if (!dest.disponibilite) {
    message += `❌ Désolé, cette destination est *complète* pour le moment.\n\n`;
    message += `Contactez un conseiller SMG pour être mis sur liste d'attente. Tapez *0*.`;
    return message;
  }

  message += `✅ *Disponible !*\n\n`;
  message += `*Prochains départs :*\n`;
  for (const date of dest.prochains_departs) {
    message += `- ${formatDate(date)}\n`;
  }

  message += `\n*Prix :* ${dest.prix_fcfa.toLocaleString('fr-FR')} FCFA (${dest.prix_euro}€) par personne\n`;
  message += `*Durée :* ${dest.duree}\n\n`;
  message += `⚠️ Les départs _"demain"_ ou à très court terme ne sont pas possibles — il faut prévoir au minimum *2 semaines* pour l'organisation (billets, hôtel${dest.visa.requis ? ', visa' : ''}).\n\n`;
  message += `Pour réserver, tapez *3* ou *"Réserver ${dest.nom.split(',')[0]}"* !`;

  return message;
}

// ── DISPONIBILITÉ GÉNÉRALE ──
function disponibiliteGenerale() {
  let message = `*📅 Disponibilités — Toutes nos destinations :*\n\n`;

  for (const dest of voyages.destinations) {
    if (dest.disponibilite) {
      const prochaineDate = formatDate(dest.prochains_departs[0]);
      message += `✅ *${dest.nom}*\n`;
      message += `Prochain départ : ${prochaineDate} — *${dest.prix_fcfa.toLocaleString('fr-FR')} FCFA*\n\n`;
    } else {
      message += `❌ *${dest.nom}* — Complet\n\n`;
    }
  }

  message += `⚠️ Un départ nécessite au minimum *2 semaines* de préparation.\n\n`;
  message += `Tapez le nom d'une destination pour plus de détails !`;

  return message;
}

// ── LISTE DES DESTINATIONS ──
function listeDestinations() {
  let message = `*✈️ Nos destinations au départ d'Abidjan :*\n\n`;

  for (const dest of voyages.destinations) {
    const dispo = dest.disponibilite ? '✅ Disponible' : '❌ Complet';
    message += `*${dest.nom}*\n`;
    message += `${dest.duree} — à partir de *${dest.prix_fcfa.toLocaleString('fr-FR')} FCFA* (${dest.prix_euro}€)\n`;
    message += `${dispo}\n\n`;
  }

  message += `Pour en savoir plus, tapez le nom d'une destination !\nExemple : _"Prix Dubai"_ ou _"Visa Paris"_`;

  return message;
}

// ── LISTE DES PRIX (toutes destinations) ──
function listePrix() {
  let message = `*💰 Tarifs SMG (par personne, tout compris) :*\n\n`;

  const destTriees = [...voyages.destinations].sort(
    (a, b) => a.prix_fcfa - b.prix_fcfa
  );

  for (const dest of destTriees) {
    message += `*${dest.nom}*\n`;
    message += `${dest.duree} — *${dest.prix_fcfa.toLocaleString('fr-FR')} FCFA* (${dest.prix_euro}€)\n\n`;
  }

  message += `Ces prix incluent : vol A/R, hôtel, transferts, petit-déjeuner et assurance.\n\n`;
  message += `Tapez le nom d'une destination pour plus de détails !`;

  return message;
}

// ── PRIX D'UNE DESTINATION SPÉCIFIQUE ──
function prixDestination(destinationId) {
  const dest = voyages.destinations.find((d) => d.id === destinationId);

  if (!dest) {
    return `Je n'ai pas trouvé cette destination. Tapez *1* ou *"destinations"* pour voir la liste complète.`;
  }

  let message = `*💰 ${dest.nom} — Détail du tarif*\n\n`;
  message += `*Prix :* ${dest.prix_fcfa.toLocaleString('fr-FR')} FCFA (${dest.prix_euro}€) par personne\n`;
  message += `*Durée :* ${dest.duree}\n\n`;

  message += `*✅ Inclus :*\n`;
  for (const item of dest.inclus) {
    message += `- ${item}\n`;
  }

  message += `\n*❌ Non inclus :*\n`;
  for (const item of dest.non_inclus) {
    message += `- ${item}\n`;
  }

  if (dest.prochains_departs.length > 0) {
    message += `\n*📅 Prochains départs :*\n`;
    for (const date of dest.prochains_departs) {
      message += `- ${formatDate(date)}\n`;
    }
  }

  message += `\nPour réserver, tapez *3* ou *"Réserver ${dest.nom.split(',')[0]}"* !`;

  return message;
}

// ── RÉSERVATION ──
function reservation(destinationId) {
  if (destinationId) {
    const dest = voyages.destinations.find((d) => d.id === destinationId);
    if (dest) {
      return (
        `*📝 Réservation — ${dest.nom}*\n\n` +
        `Super choix ! Pour finaliser votre réservation, j'ai besoin de quelques informations :\n\n` +
        `1️⃣ *Date de départ souhaitée* parmi :\n` +
        dest.prochains_departs.map((d) => `   - ${formatDate(d)}`).join('\n') +
        `\n\n2️⃣ *Nombre de voyageurs*\n\n` +
        `3️⃣ *Votre nom complet*\n\n` +
        `4️⃣ *Votre numéro de téléphone* (si différent de celui-ci)\n\n` +
        `Envoyez ces informations et un conseiller SMG vous contactera sous *30 minutes* pour confirmer et organiser le paiement. 😊`
      );
    }
  }

  return (
    `*📝 Réservation SMG*\n\n` +
    `Je serais ravi de vous aider à réserver ! 😊\n\n` +
    `Pour quelle destination souhaitez-vous réserver ?\n\n` +
    voyages.destinations
      .map((d) => `- *${d.nom.split(',')[0]}* (${d.prix_fcfa.toLocaleString('fr-FR')} FCFA)`)
      .join('\n') +
    `\n\nTapez le nom de la destination !`
  );
}

// ── RÉSERVATION : ÉTAPE DATE ──
function reservationEtapeDate(destinationId) {
  const dest = voyages.destinations.find((d) => d.id === destinationId);
  if (!dest) return reservation(null);

  let message = `*📝 Réservation — ${dest.nom}*\n\n`;
  message += `Super choix ! Commençons la réservation étape par étape.\n\n`;
  message += `*Étape 1/4* — Quelle *date de départ* souhaitez-vous ?\n\n`;
  message += `Dates disponibles :\n`;
  for (const date of dest.prochains_departs) {
    message += `- ${formatDate(date)}\n`;
  }
  message += `\nTapez la date souhaitée ou tapez *menu* pour annuler.`;
  return message;
}

// ── RÉSERVATION : RÉCAPITULATIF FINAL ──
function reservationRecapitulatif(donnees) {
  const dest = voyages.destinations.find((d) => d.id === donnees.destination);
  const nomDest = dest ? dest.nom : donnees.destination;
  const prix = dest ? dest.prix_fcfa : 0;
  const nbVoyageurs = parseInt(donnees.voyageurs) || 1;
  const prixTotal = prix * nbVoyageurs;

  let message = `*✅ Récapitulatif de votre réservation :*\n\n`;
  message += `*Destination :* ${nomDest}\n`;
  message += `*Date de départ :* ${donnees.date}\n`;
  message += `*Nombre de voyageurs :* ${donnees.voyageurs}\n`;
  message += `*Nom :* ${donnees.nom}\n`;
  message += `*Téléphone :* ${donnees.telephone}\n\n`;

  if (dest) {
    message += `*Prix par personne :* ${prix.toLocaleString('fr-FR')} FCFA\n`;
    message += `*Prix total :* ${prixTotal.toLocaleString('fr-FR')} FCFA\n\n`;
  }

  message += `🎉 *Votre demande de réservation est enregistrée !*\n\n`;
  message += `Un conseiller SMG vous contactera sous *30 minutes* pour :\n`;
  message += `- Confirmer la disponibilité\n`;
  message += `- Organiser le paiement\n`;
  message += `- Répondre à vos questions\n\n`;
  message += `Merci de votre confiance ! ✈️😊\n`;
  message += `\nTapez *menu* pour revenir au menu principal.`;

  return message;
}

// ── SUIVI DE DOSSIER ──
function suiviDossier() {
  return (
    `*📋 Suivi de votre dossier*\n\n` +
    `Pour consulter l'état de votre réservation, envoyez-moi votre *numéro de dossier*.\n\n` +
    `Votre numéro de dossier se trouve dans le message de confirmation que vous avez reçu lors de votre réservation.\n\n` +
    `Format : _SMG-XXXXX_\n\n` +
    `Si vous n'avez pas votre numéro, tapez *0* pour parler à un conseiller.`
  );
}

// ── VISA : DESTINATION SPÉCIFIQUE ──
function visaDestination(destinationId) {
  const dest = voyages.destinations.find((d) => d.id === destinationId);

  if (!dest) {
    return visaGeneral();
  }

  const visa = dest.visa;
  let message = `*🛂 Visa — ${dest.nom}*\n\n`;

  if (!visa.requis) {
    message += `*Bonne nouvelle !* Aucun visa n'est requis pour les Ivoiriens. 🎉\n\n`;
    message += `*Documents nécessaires :*\n`;
  } else {
    message += `*Type :* ${visa.type}\n`;
    message += `*Délai :* ${visa.delai}\n`;
    message += `*Coût :* ${visa.cout_visa_fcfa.toLocaleString('fr-FR')} FCFA\n`;
    message += `*Lieu de dépôt :* ${visa.lieu_depot}\n\n`;
    message += `*Documents requis :*\n`;
  }

  for (const doc of visa.documents) {
    message += `- ${doc}\n`;
  }

  message += `\nSMG peut vous accompagner dans vos démarches de visa. Tapez *3* ou *"réserver"* pour commencer !`;

  return message;
}

// ── VISA : GÉNÉRAL ──
function visaGeneral() {
  let message = `*🛂 Infos visa pour passeport ivoirien :*\n\n`;

  const sansVisa = voyages.destinations.filter((d) => !d.visa.requis);
  if (sansVisa.length > 0) {
    message += `*✅ Sans visa :*\n`;
    for (const d of sansVisa) {
      message += `- ${d.nom}\n`;
    }
    message += `\n`;
  }

  const avecVisa = voyages.destinations.filter((d) => d.visa.requis);
  message += `*📋 Visa requis :*\n`;
  for (const d of avecVisa) {
    message += `- *${d.nom.split(',')[0]}* : ${d.visa.type} (${d.visa.delai}) — ${d.visa.cout_visa_fcfa.toLocaleString('fr-FR')} FCFA\n`;
  }

  message += `\nPour les détails visa d'une destination, tapez _"Visa Paris"_ par exemple.\nSMG vous accompagne dans toutes vos démarches ! 💪`;

  return message;
}

// ── FAQ : BAGAGES ──
function faqBagages() {
  return voyages.faq.bagages.reponse;
}

// ── FAQ : ASSURANCE ──
function faqAssurance() {
  return voyages.faq.assurance.reponse;
}

// ── FAQ : ANNULATION ──
function faqAnnulation() {
  return voyages.faq.annulation.reponse;
}

// ── FAQ : PAIEMENT ──
function faqPaiement() {
  return voyages.faq.paiement.reponse;
}

// ── MESSAGE D'ESCALADE (transfert vers humain) ──
function escaladeMessage() {
  return (
    `*🤝 Transfert vers un conseiller SMG*\n\n` +
    `Je transfère votre demande à un conseiller SMG qui vous contactera sous *30 minutes*.\n\n` +
    `En attendant, n'hésitez pas à me poser d'autres questions ! Tapez *menu* pour revoir les options. 😊`
  );
}

// ── INCOMPRÉHENSION (le bot ne comprend pas) ──
function incomprehension(tentative) {
  return (
    `Je n'ai pas compris votre demande. 🤔\n\n` +
    `Vous pouvez taper un *chiffre* du menu ou écrire votre demande librement 😊\n\n` +
    `1️⃣ Destinations\n` +
    `2️⃣ Prix\n` +
    `3️⃣ Réserver\n` +
    `4️⃣ Suivi dossier\n` +
    `5️⃣ FAQ\n` +
    `0️⃣ Parler à un conseiller\n\n` +
    `Ou tapez *menu* pour revoir toutes les options.`
  );
}

// ── REMERCIEMENT ──
function remerciement() {
  return (
    `Avec plaisir ! 😊\n\n` +
    `N'hésitez pas à revenir si vous avez d'autres questions. Tapez *menu* à tout moment !\n` +
    `L'équipe SMG est là pour vous ! ✈️🌍`
  );
}

// ── INFOS DESTINATION (météo, monnaie, santé, etc.) ──
function infoDestination(destinationId, type) {
  if (!destinationId) {
    return `Pour quelle destination souhaitez-vous cette information ?\n\n` +
      voyages.destinations.map(d => `- *${d.nom.split(',')[0]}*`).join('\n') +
      `\n\nExemple : _"Météo Dubai"_ ou _"Vaccins Bangkok"_`;
  }

  const info = connaissances.destinations[destinationId];
  const dest = voyages.destinations.find(d => d.id === destinationId);
  const nomDest = dest ? dest.nom : destinationId;

  if (!info) {
    return `Je n'ai pas encore d'informations détaillées sur cette destination. Un conseiller SMG peut vous aider ! Tapez *0*.`;
  }

  switch (type) {
    case 'meteo': {
      const m = info.meteo;
      return `*🌤️ Météo — ${nomDest}*\n\n` +
        `*Meilleure période :* ${m.meilleure_periode}\n` +
        `*Températures :* ${m.temperatures}\n\n` +
        `${m.detail}`;
    }

    case 'monnaie': {
      const m = info.monnaie;
      return `*💱 Monnaie — ${nomDest}*\n\n` +
        `*Devise :* ${m.devise}\n` +
        `*Taux :* ${m.taux_fcfa}\n\n` +
        `💡 ${m.conseil}`;
    }

    case 'horaire':
      return `*🕐 Décalage horaire — ${nomDest}*\n\n` +
        `${info.decalage_horaire}\n\n` +
        `Pensez à ajuster votre horloge en arrivant !`;

    case 'langue':
      return `*🗣️ Langue — ${nomDest}*\n\n` +
        `${info.langue}`;

    case 'sante': {
      const s = info.sante;
      return `*🏥 Santé & Vaccins — ${nomDest}*\n\n` +
        `*Vaccins :* ${s.vaccins}\n\n` +
        `*Conseils santé :* ${s.conseils}`;
    }

    case 'securite':
      return `*🔒 Sécurité — ${nomDest}*\n\n` +
        `${info.securite}`;

    case 'culture':
      return `*🎭 Culture & Coutumes — ${nomDest}*\n\n` +
        `${info.culture}`;

    case 'nourriture': {
      const n = info.nourriture;
      return `*🍽️ Nourriture — ${nomDest}*\n\n` +
        `*Budget repas :* ${n.budget_repas}\n\n` +
        `*Spécialités locales :* ${n.specialites}\n\n` +
        `*Halal :* ${n.halal}`;
    }

    case 'transport':
      return `*🚕 Transport local — ${nomDest}*\n\n` +
        `${info.transport_local}`;

    case 'emporter':
      return `*🧳 Quoi emporter — ${nomDest}*\n\n` +
        `${info.quoi_emporter}`;

    case 'compagnies':
      return `*✈️ Compagnies aériennes — ${nomDest}*\n\n` +
        `*Depuis Abidjan :* ${info.compagnies_aeriennes}`;

    case 'activites':
      return `*📸 À voir / À faire — ${nomDest}*\n\n` +
        `*Incontournables :* ${info.a_voir}`;

    case 'internet':
      return `*📱 Internet & SIM — ${nomDest}*\n\n` +
        `${info.sim_internet}`;

    case 'urgences':
      return `*🆘 Numéros d'urgence — ${nomDest}*\n\n` +
        `${info.urgences}`;

    case 'electricite':
      return `*🔌 Électricité — ${nomDest}*\n\n` +
        `${info.electricite}`;

    default:
      return `Je n'ai pas cette information. Tapez *0* pour parler à un conseiller.`;
  }
}

// ── UTILITAIRE : Formater une date ──
function formatDate(dateStr) {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  const parts = dateStr.split('-');
  const jour = parseInt(parts[2], 10);
  const moisIndex = parseInt(parts[1], 10) - 1;
  const annee = parts[0];
  return `${jour} ${mois[moisIndex]} ${annee}`;
}

module.exports = {
  salutation,
  miniMenu,
  faqMenu,
  disponibiliteDestination,
  disponibiliteGenerale,
  listeDestinations,
  listePrix,
  prixDestination,
  reservation,
  reservationEtapeDate,
  reservationRecapitulatif,
  suiviDossier,
  visaDestination,
  visaGeneral,
  faqBagages,
  faqAssurance,
  faqAnnulation,
  faqPaiement,
  escaladeMessage,
  incomprehension,
  remerciement,
  infoDestination,
};
