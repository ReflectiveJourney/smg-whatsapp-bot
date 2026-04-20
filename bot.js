// ============================================
// BOT.JS — Cerveau principal du bot
// Option A — Twilio
// ============================================
// Ce fichier analyse chaque message du client, détecte ce qu'il veut
// et maintient un contexte de conversation par utilisateur.
// Supporte la navigation par chiffre ET par texte libre.

const reponses = require('./reponses');
const claude = require('./claude');
const escalade = require('./escalade');

// Contexte de conversation par utilisateur
// Stocke : dernière destination, dernière action, historique, données collectées
const contextes = {};

// Compteur d'incompréhensions
const incomprehensions = {};

// Initialise ou récupère le contexte d'un client
function getContexte(numeroClient) {
  if (!contextes[numeroClient]) {
    contextes[numeroClient] = {
      derniereDestination: null,    // ex: "paris"
      derniereAction: null,         // ex: "disponibilite", "prix", "reservation"
      historique: [],               // les 10 derniers échanges
      donneesCollectees: {},        // dates, nb personnes, nom...
      reservationEtape: null,       // étape en cours : "date", "voyageurs", "nom", "telephone"
    };
  }
  return contextes[numeroClient];
}

// Détecte l'intention du client à partir de son message
function detecterIntention(message) {
  const msg = message.toLowerCase().trim();

  // --- NAVIGATION PAR CHIFFRE ---
  if (/^[0-6]$/.test(msg)) {
    switch (msg) {
      case '1': return 'destinations';
      case '2': return 'prix';
      case '3': return 'reservation';
      case '4': return 'suivi';
      case '5': return 'faq_menu';
      case '6':
      case '0': return 'escalade_directe';
    }
  }

  // --- MENU / AIDE ---
  if (/^(menu|aide|help|accueil|retour)$/i.test(msg)) {
    return 'salutation';
  }

  // --- SALUTATIONS ---
  if (/^(bonjour|salut|bonsoir|hello|hi|hey|coucou|yo|bjr|slt)/i.test(msg)) {
    return 'salutation';
  }

  // --- DISPONIBILITÉ ---
  if (
    msg.includes('disponib') ||
    msg.includes('je peux aller') ||
    msg.includes('je peux partir') ||
    msg.includes('c\'est possible') ||
    msg.includes('il y a des place') ||
    msg.includes('reste des place') ||
    msg.includes('demain') ||
    msg.includes('quand partir') ||
    msg.includes('prochaine date') ||
    msg.includes('prochain depart') ||
    msg.includes('prochain départ') ||
    msg.includes('quand est le prochain') ||
    msg.includes('date de départ') ||
    msg.includes('date de depart')
  ) {
    return 'disponibilite';
  }

  // --- DESTINATIONS ---
  if (
    msg.includes('destination') ||
    msg.includes('voyage') ||
    msg.includes('voyager') ||
    msg.includes('ou aller') ||
    msg.includes('où aller') ||
    msg.includes('pays') ||
    msg.includes('proposez') ||
    msg.includes('liste')
  ) {
    return 'destinations';
  }

  // --- PRIX ---
  if (
    msg.includes('prix') ||
    msg.includes('tarif') ||
    msg.includes('coût') ||
    msg.includes('cout') ||
    msg.includes('combien') ||
    msg.includes('fcfa') ||
    msg.includes('euro') ||
    msg.includes('cher') ||
    msg.includes('budget') ||
    msg.includes('moins cher') ||
    msg.includes('promotion')
  ) {
    return 'prix';
  }

  // --- RÉSERVATION / ENVIE DE VOYAGER ---
  if (
    msg.includes('réserv') ||
    msg.includes('reserv') ||
    msg.includes('book') ||
    msg.includes('je veux partir') ||
    msg.includes('je voudrais partir') ||
    msg.includes('je souhaite') ||
    msg.includes('j\'aimerais aller') ||
    msg.includes('j\'aimerais partir') ||
    msg.includes('j\'aimerais voyager') ||
    msg.includes('je veux aller') ||
    msg.includes('je voudrais aller') ||
    msg.includes('je veux voyager') ||
    msg.includes('inscription') ||
    msg.includes('inscrire') ||
    msg.includes('payer') ||
    msg.includes('paiement')
  ) {
    return 'reservation';
  }

  // --- SUIVI DE DOSSIER ---
  if (
    msg.includes('dossier') ||
    msg.includes('suivi') ||
    msg.includes('numéro') ||
    msg.includes('numero') ||
    msg.includes('statut') ||
    msg.includes('où en est') ||
    msg.includes('ou en est') ||
    msg.includes('confirmation')
  ) {
    return 'suivi';
  }

  // --- FAQ : VISA ---
  if (
    msg.includes('visa') ||
    msg.includes('passeport') ||
    msg.includes('document') ||
    msg.includes('papier') ||
    msg.includes('ambassade') ||
    msg.includes('consulat')
  ) {
    return 'faq_visa';
  }

  // --- FAQ : BAGAGES ---
  if (
    msg.includes('bagage') ||
    msg.includes('valise') ||
    msg.includes('kilo') ||
    msg.includes('poids')
  ) {
    return 'faq_bagages';
  }

  // --- FAQ : ASSURANCE ---
  if (
    msg.includes('assurance') ||
    msg.includes('couverture') ||
    msg.includes('médical') ||
    msg.includes('medical')
  ) {
    return 'faq_assurance';
  }

  // --- FAQ : ANNULATION ---
  if (
    msg.includes('annul') ||
    msg.includes('rembours') ||
    msg.includes('modifier') ||
    msg.includes('changer')
  ) {
    return 'faq_annulation';
  }

  // --- FAQ : PAIEMENT ---
  if (
    msg.includes('orange money') ||
    msg.includes('mtn money') ||
    msg.includes('moov') ||
    msg.includes('wave') ||
    msg.includes('mobile money') ||
    msg.includes('mode de paiement') ||
    msg.includes('comment payer')
  ) {
    return 'faq_paiement';
  }

  // --- FAQ GÉNÉRAL ---
  if (/^faq$/i.test(msg)) {
    return 'faq_menu';
  }

  // --- MÉTÉO / CLIMAT ---
  if (
    msg.includes('météo') || msg.includes('meteo') ||
    msg.includes('climat') || msg.includes('température') ||
    msg.includes('temperature') || msg.includes('chaud') ||
    msg.includes('froid') || msg.includes('pluie') ||
    msg.includes('saison') || msg.includes('temps qu\'il fait') ||
    msg.includes('quand partir') || msg.includes('meilleur moment') ||
    msg.includes('meilleure période') || msg.includes('meilleure periode')
  ) {
    return 'info_meteo';
  }

  // --- MONNAIE / CHANGE ---
  if (
    msg.includes('monnaie') || msg.includes('devise') ||
    msg.includes('change') || msg.includes('taux') ||
    msg.includes('dollar') || msg.includes('euro') ||
    msg.includes('argent sur place') || msg.includes('distributeur') ||
    msg.includes('carte bancaire') || msg.includes('retirer')
  ) {
    return 'info_monnaie';
  }

  // --- DÉCALAGE HORAIRE ---
  if (
    msg.includes('heure') || msg.includes('horaire') ||
    msg.includes('décalage') || msg.includes('decalage') ||
    msg.includes('fuseau')
  ) {
    return 'info_horaire';
  }

  // --- LANGUE ---
  if (
    msg.includes('langue') || msg.includes('parle') ||
    msg.includes('anglais') || msg.includes('francais') ||
    msg.includes('français') || msg.includes('communiquer')
  ) {
    return 'info_langue';
  }

  // --- SANTÉ / VACCINS ---
  if (
    msg.includes('vaccin') || msg.includes('santé') ||
    msg.includes('sante') || msg.includes('médecin') ||
    msg.includes('medecin') || msg.includes('hôpital') ||
    msg.includes('hopital') || msg.includes('maladie') ||
    msg.includes('paludisme') || msg.includes('moustique') ||
    msg.includes('pharmacie')
  ) {
    return 'info_sante';
  }

  // --- SÉCURITÉ ---
  if (
    msg.includes('sécurité') || msg.includes('securite') ||
    msg.includes('danger') || msg.includes('sûr') ||
    msg.includes('sur') || msg.includes('risque') ||
    msg.includes('vol') || msg.includes('pickpocket') ||
    msg.includes('arnaque')
  ) {
    return 'info_securite';
  }

  // --- CULTURE / COUTUMES ---
  if (
    msg.includes('culture') || msg.includes('coutume') ||
    msg.includes('tradition') || msg.includes('religion') ||
    msg.includes('pourboire') || msg.includes('tip') ||
    msg.includes('s\'habiller') || msg.includes('vestimentaire') ||
    msg.includes('ramadan')
  ) {
    return 'info_culture';
  }

  // --- NOURRITURE / RESTAURANTS ---
  if (
    msg.includes('manger') || msg.includes('nourriture') ||
    msg.includes('restaurant') || msg.includes('plat') ||
    msg.includes('cuisine') || msg.includes('spécialité') ||
    msg.includes('specialite') || msg.includes('halal') ||
    msg.includes('gastronomie') || msg.includes('repas') ||
    msg.includes('budget repas') || msg.includes('street food')
  ) {
    return 'info_nourriture';
  }

  // --- TRANSPORT LOCAL ---
  if (
    msg.includes('transport') || msg.includes('métro') ||
    msg.includes('metro') || msg.includes('taxi') ||
    msg.includes('uber') || msg.includes('bus') ||
    msg.includes('se déplacer') || msg.includes('se deplacer') ||
    msg.includes('circuler')
  ) {
    return 'info_transport';
  }

  // --- QUOI EMPORTER / VALISE ---
  if (
    msg.includes('emporter') || msg.includes('apporter') ||
    msg.includes('préparer') || msg.includes('preparer') ||
    msg.includes('quoi prendre') || msg.includes('dans la valise') ||
    msg.includes('check-list') || msg.includes('checklist') ||
    msg.includes('vetement') || msg.includes('vêtement')
  ) {
    return 'info_emporter';
  }

  // --- COMPAGNIES AÉRIENNES ---
  if (
    msg.includes('compagnie') || msg.includes('aérien') ||
    msg.includes('aerien') || msg.includes('vol') ||
    msg.includes('avion') || msg.includes('airline') ||
    msg.includes('air france') || msg.includes('turkish') ||
    msg.includes('emirates') || msg.includes('ethiopian') ||
    msg.includes('escale') || msg.includes('durée vol') ||
    msg.includes('duree vol') || msg.includes('direct')
  ) {
    return 'info_compagnies';
  }

  // --- ACTIVITÉS / À VOIR ---
  if (
    msg.includes('voir') || msg.includes('visiter') ||
    msg.includes('activité') || msg.includes('activite') ||
    msg.includes('attraction') || msg.includes('monument') ||
    msg.includes('musée') || msg.includes('musee') ||
    msg.includes('incontournable') || msg.includes('faire sur place') ||
    msg.includes('touristique')
  ) {
    return 'info_activites';
  }

  // --- INTERNET / SIM ---
  if (
    msg.includes('internet') || msg.includes('wifi') ||
    msg.includes('wi-fi') || msg.includes('sim') ||
    msg.includes('réseau') || msg.includes('reseau') ||
    msg.includes('data') || msg.includes('téléphone sur place') ||
    msg.includes('telephone sur place')
  ) {
    return 'info_internet';
  }

  // --- URGENCES ---
  if (
    msg.includes('urgence') || msg.includes('numéro d\'urgence') ||
    msg.includes('numero d\'urgence') || msg.includes('police') ||
    msg.includes('ambulance') || msg.includes('pompier') ||
    msg.includes('secours') || msg.includes('sos')
  ) {
    return 'info_urgences';
  }

  // --- ÉLECTRICITÉ / PRISES ---
  if (
    msg.includes('prise') || msg.includes('électricité') ||
    msg.includes('electricite') || msg.includes('adaptateur') ||
    msg.includes('courant') || msg.includes('volt') ||
    msg.includes('brancher') || msg.includes('chargeur')
  ) {
    return 'info_electricite';
  }

  // --- COMPARAISON ---
  if (
    msg.includes('mieux') || msg.includes('comparer') ||
    msg.includes('comparaison') || msg.includes('différence') ||
    msg.includes('difference') || msg.includes('ou bien') ||
    msg.includes('plutôt') || msg.includes('plutot') ||
    msg.includes('lequel') || msg.includes('laquelle')
  ) {
    return 'info_comparaison';
  }

  // --- INFORMATIONS CONFIDENTIELLES ---
  if (
    msg.includes('marge') ||
    msg.includes('commission') ||
    msg.includes('fournisseur') ||
    msg.includes('contrat') ||
    msg.includes('mot de passe') ||
    msg.includes('password') ||
    msg.includes('accès système') ||
    msg.includes('acces systeme') ||
    msg.includes('données client') ||
    msg.includes('donnees client') ||
    msg.includes('coordonnées partenaire') ||
    msg.includes('coordonnees partenaire')
  ) {
    return 'info_confidentielle';
  }

  // --- PARLER À UN HUMAIN ---
  if (
    msg.includes('humain') ||
    msg.includes('agent') ||
    msg.includes('conseiller') ||
    msg.includes('personne réelle') ||
    msg.includes('personne reelle') ||
    msg.includes('parler à quelqu') ||
    msg.includes('parler a quelqu')
  ) {
    return 'escalade_directe';
  }

  // --- REMERCIEMENTS ---
  if (
    /^(merci|thanks|thank you|c'est gentil|parfait|super|ok merci)/i.test(msg)
  ) {
    return 'remerciement';
  }

  // --- RÉFÉRENCE IMPLICITE ---
  if (/^(et |et pour |et le |et la |et les |c'est )/.test(msg)) {
    return 'reference_implicite';
  }

  // --- TOUT LE RESTE → envoyer à l'IA ---
  // Le bot tente TOUJOURS de répondre via Gemini/Claude
  // avant de dire qu'il ne comprend pas
  return 'question_ia';
}

// Extrait le nom d'une destination mentionnée dans le message
function extraireDestination(message) {
  const msg = message.toLowerCase();
  const destinations = [
    { id: 'paris', mots: ['paris', 'france'] },
    { id: 'dubai', mots: ['dubai', 'dubaï', 'emirat', 'émirat'] },
    { id: 'istanbul', mots: ['istanbul', 'turquie'] },
    { id: 'marrakech', mots: ['marrakech', 'maroc', 'marocain'] },
    { id: 'cap_vert', mots: ['cap-vert', 'cap vert', 'capvert', 'praia', 'santiago', 'tarrafal', 'cidade velha'] },
    { id: 'dakar', mots: ['dakar', 'sénégal', 'senegal', 'saly', 'lac rose', 'goree', 'gorée'] },
    { id: 'johannesburg', mots: ['johannesburg', 'afrique du sud', 'joburg'] },
    { id: 'new_york', mots: ['new york', 'nyc', 'états-unis', 'etats-unis', 'usa', 'amerique', 'amérique'] },
    { id: 'bangkok', mots: ['bangkok', 'thailande', 'thaïlande'] }
  ];

  for (const dest of destinations) {
    for (const mot of dest.mots) {
      if (msg.includes(mot)) {
        return dest.id;
      }
    }
  }
  return null;
}

// Résout la destination : celle du message, ou celle du contexte
function resoudreDestination(destinationMessage, contexte) {
  if (destinationMessage) {
    // Nouvelle destination mentionnée → on met à jour le contexte
    contexte.derniereDestination = destinationMessage;
    return destinationMessage;
  }
  // Pas de destination dans le message → on utilise celle du contexte
  return contexte.derniereDestination;
}

// Détecte l'intention d'une référence implicite ("c'est combien ?", "et le visa ?")
function detecterIntentionImplicite(message) {
  const msg = message.toLowerCase();

  if (msg.includes('combien') || msg.includes('prix') || msg.includes('tarif') || msg.includes('cout') || msg.includes('coût')) {
    return 'prix';
  }
  if (msg.includes('visa') || msg.includes('document') || msg.includes('papier')) {
    return 'faq_visa';
  }
  if (msg.includes('disponib') || msg.includes('date') || msg.includes('depart') || msg.includes('départ') || msg.includes('place')) {
    return 'disponibilite';
  }
  if (msg.includes('réserv') || msg.includes('reserv') || msg.includes('book')) {
    return 'reservation';
  }
  if (msg.includes('bagage') || msg.includes('valise')) {
    return 'faq_bagages';
  }
  if (msg.includes('assurance')) {
    return 'faq_assurance';
  }
  if (msg.includes('annul')) {
    return 'faq_annulation';
  }

  return null;
}

// Gère la collecte séquentielle des infos de réservation
function traiterEtapeReservation(message, ctx, numeroClient) {
  const msg = message.toLowerCase().trim();

  // Si le client veut annuler ou revenir au menu
  if (msg === 'menu' || msg === 'annuler' || msg === 'retour' || msg === '0') {
    ctx.reservationEtape = null;
    ctx.donneesCollectees = {};
    return reponses.salutation();
  }

  switch (ctx.reservationEtape) {
    case 'destination': {
      // Le client doit choisir une destination
      const destId = extraireDestination(message);
      if (destId) {
        ctx.donneesCollectees.destination = destId;
        ctx.derniereDestination = destId;
        ctx.reservationEtape = 'date';
        return reponses.reservationEtapeDate(destId);
      }
      return `Je n'ai pas trouvé cette destination. Tapez le nom d'une de nos destinations :\n\n` +
        require('./voyages.json').destinations
          .map(d => `- *${d.nom.split(',')[0]}*`)
          .join('\n') +
        `\n\nOu tapez *menu* pour revenir au menu principal.`;
    }

    case 'date': {
      // Le client donne une date de départ
      ctx.donneesCollectees.date = message.trim();
      ctx.reservationEtape = 'voyageurs';
      return `✅ Date notée : *${message.trim()}*\n\nCombien de *voyageurs* participeront au voyage ? (ex: _2_)`;
    }

    case 'voyageurs': {
      // Le client donne le nombre de voyageurs
      const nb = message.trim();
      ctx.donneesCollectees.voyageurs = nb;
      ctx.reservationEtape = 'nom';
      return `✅ *${nb} voyageur(s)* noté(s).\n\nQuel est votre *nom complet* ? (ex: _Kouassi Jean-Marc_)`;
    }

    case 'nom': {
      // Le client donne son nom
      ctx.donneesCollectees.nom = message.trim();
      ctx.reservationEtape = 'telephone';
      return `✅ Merci *${message.trim()}* !\n\nQuel est votre *numéro de téléphone* ? (ex: _+225 07 89 03 14_)\n\nSi c'est le même que celui-ci, tapez *oui*.`;
    }

    case 'telephone': {
      // Le client donne son téléphone
      if (msg === 'oui' || msg === 'o') {
        ctx.donneesCollectees.telephone = numeroClient;
      } else {
        ctx.donneesCollectees.telephone = message.trim();
      }
      ctx.reservationEtape = null; // Fin du flux

      // Générer le récapitulatif
      return reponses.reservationRecapitulatif(ctx.donneesCollectees);
    }

    default:
      ctx.reservationEtape = null;
      return null;
  }
}

// Fonction principale : traite chaque message et retourne la réponse
async function traiterMessage(message, numeroClient) {
  const ctx = getContexte(numeroClient);

  if (!incomprehensions[numeroClient]) {
    incomprehensions[numeroClient] = 0;
  }

  // Ajouter le message du client à l'historique (garder max 10 échanges = 20 éléments)
  ctx.historique.push({ role: 'user', content: message });
  if (ctx.historique.length > 20) {
    ctx.historique = ctx.historique.slice(-20);
  }

  // --- FLUX DE RÉSERVATION EN COURS ---
  // Si le client est en train de remplir une réservation étape par étape,
  // on traite sa réponse directement sans chercher une intention
  if (ctx.reservationEtape) {
    const reponseReservation = traiterEtapeReservation(message, ctx, numeroClient);
    if (reponseReservation) {
      ctx.historique.push({ role: 'assistant', content: reponseReservation });
      return reponseReservation;
    }
  }

  // Détecter l'intention et la destination
  let intention = detecterIntention(message);
  const destinationMessage = extraireDestination(message);
  let destinationId = resoudreDestination(destinationMessage, ctx);

  // Gérer les références implicites
  if (intention === 'reference_implicite') {
    // Chercher une nouvelle destination dans le message ("et pour Dubai ?")
    if (destinationMessage) {
      destinationId = destinationMessage;
      ctx.derniereDestination = destinationMessage;
    }

    // Détecter l'intention cachée dans la référence
    const intentionImplicite = detecterIntentionImplicite(message);
    if (intentionImplicite) {
      intention = intentionImplicite;
    } else if (ctx.derniereAction) {
      // Même intention que la dernière action ("et pour Dubai ?" après avoir demandé les prix)
      intention = ctx.derniereAction;
    } else {
      // On ne sait pas quoi faire → demander gentiment
      intention = 'clarification_contexte';
    }
  }

  let reponse;

  switch (intention) {
    case 'salutation':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.salutation();
      break;

    case 'disponibilite':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'disponibilite';
      if (destinationId) {
        reponse = reponses.disponibiliteDestination(destinationId) + reponses.miniMenu();
      } else {
        reponse = reponses.disponibiliteGenerale() + reponses.miniMenu();
      }
      break;

    case 'destinations':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'destinations';
      reponse = reponses.listeDestinations() + reponses.miniMenu();
      break;

    case 'prix':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'prix';
      if (destinationId) {
        reponse = reponses.prixDestination(destinationId) + reponses.miniMenu();
      } else {
        reponse = reponses.listePrix() + reponses.miniMenu();
      }
      break;

    case 'reservation':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'reservation';
      if (destinationId) {
        // Destination connue → démarrer la collecte à l'étape "date"
        ctx.donneesCollectees = { destination: destinationId };
        ctx.reservationEtape = 'date';
        reponse = reponses.reservationEtapeDate(destinationId);
      } else {
        // Pas de destination → demander laquelle
        ctx.reservationEtape = 'destination';
        ctx.donneesCollectees = {};
        reponse = reponses.reservation(null) + reponses.miniMenu();
      }
      break;

    case 'suivi':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'suivi';
      reponse = reponses.suiviDossier() + reponses.miniMenu();
      break;

    case 'faq_menu':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.faqMenu();
      break;

    case 'faq_visa':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'faq_visa';
      if (destinationId) {
        reponse = reponses.visaDestination(destinationId) + reponses.miniMenu();
      } else {
        reponse = reponses.visaGeneral() + reponses.miniMenu();
      }
      break;

    case 'faq_bagages':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'faq_bagages';
      reponse = reponses.faqBagages() + reponses.miniMenu();
      break;

    case 'faq_assurance':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'faq_assurance';
      reponse = reponses.faqAssurance() + reponses.miniMenu();
      break;

    case 'faq_annulation':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'faq_annulation';
      reponse = reponses.faqAnnulation() + reponses.miniMenu();
      break;

    case 'faq_paiement':
      incomprehensions[numeroClient] = 0;
      ctx.derniereAction = 'faq_paiement';
      reponse = reponses.faqPaiement() + reponses.miniMenu();
      break;

    case 'escalade_directe':
      incomprehensions[numeroClient] = 0;
      try {
        await escalade.transfererAdmin(
          numeroClient,
          message,
          ctx.historique,
          'Le client demande à parler à un humain'
        );
      } catch (errEscalade) {
        console.error('Erreur escalade :', errEscalade.message);
      }
      reponse = reponses.escaladeMessage();
      break;

    case 'remerciement':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.remerciement();
      break;

    case 'info_meteo':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'meteo') + reponses.miniMenu();
      break;

    case 'info_monnaie':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'monnaie') + reponses.miniMenu();
      break;

    case 'info_horaire':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'horaire') + reponses.miniMenu();
      break;

    case 'info_langue':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'langue') + reponses.miniMenu();
      break;

    case 'info_sante':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'sante') + reponses.miniMenu();
      break;

    case 'info_securite':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'securite') + reponses.miniMenu();
      break;

    case 'info_culture':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'culture') + reponses.miniMenu();
      break;

    case 'info_nourriture':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'nourriture') + reponses.miniMenu();
      break;

    case 'info_transport':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'transport') + reponses.miniMenu();
      break;

    case 'info_emporter':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'emporter') + reponses.miniMenu();
      break;

    case 'info_compagnies':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'compagnies') + reponses.miniMenu();
      break;

    case 'info_activites':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'activites') + reponses.miniMenu();
      break;

    case 'info_internet':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'internet') + reponses.miniMenu();
      break;

    case 'info_urgences':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'urgences') + reponses.miniMenu();
      break;

    case 'info_electricite':
      incomprehensions[numeroClient] = 0;
      reponse = reponses.infoDestination(destinationId || ctx.derniereDestination, 'electricite') + reponses.miniMenu();
      break;

    case 'info_comparaison':
      incomprehensions[numeroClient] = 0;
      // Les comparaisons sont complexes → envoyées à l'IA
      try {
        const reponseIA = await claude.analyserMessage(message, ctx.historique);
        if (reponseIA) {
          reponse = reponseIA + reponses.miniMenu();
        } else {
          reponse = `Pour comparer ces destinations en détail, je vous mets en relation avec un conseiller SMG 😊`;
        }
      } catch (err) {
        reponse = `Pour comparer ces destinations en détail, je vous mets en relation avec un conseiller SMG 😊`;
      }
      break;

    case 'info_confidentielle':
      incomprehensions[numeroClient] = 0;
      reponse = `Cette information est réservée à notre équipe interne. Puis-je vous aider avec autre chose ? 😊` + reponses.miniMenu();
      break;

    case 'clarification_contexte':
      incomprehensions[numeroClient] = 0;
      if (ctx.derniereDestination) {
        const voyagesData = require('./voyages.json');
        const dest = voyagesData.destinations.find(d => d.id === ctx.derniereDestination);
        const nomDest = dest ? dest.nom.split(',')[0] : ctx.derniereDestination;
        reponse = `Vous parlez toujours de *${nomDest}* ou d'autre chose ? 😊\n\nVous pouvez me demander :\n- _"Prix ${nomDest}"_\n- _"Visa ${nomDest}"_\n- _"Disponibilité ${nomDest}"_\n- _"Réserver ${nomDest}"_` + reponses.miniMenu();
      } else {
        reponse = reponses.incomprehension(1);
      }
      break;

    case 'question_ia':
    default:
      // TOUTE question non reconnue est envoyée à l'IA (Gemini/Claude)
      // Le bot tente TOUJOURS de répondre avant de dire qu'il ne sait pas
      try {
        const reponseIA = await claude.analyserMessage(
          message,
          ctx.historique
        );

        if (reponseIA) {
          incomprehensions[numeroClient] = 0;
          reponse = reponseIA + reponses.miniMenu();
        } else {
          // L'IA a répondu qu'elle ne sait pas → compter comme incompréhension
          incomprehensions[numeroClient]++;
        }
      } catch (erreur) {
        console.error('Erreur IA :', erreur.message);
        // Erreur technique → escalade automatique, JAMAIS d'erreur visible au client
        incomprehensions[numeroClient] = 0;
        try {
          await escalade.transfererAdmin(
            numeroClient,
            message,
            ctx.historique,
            'Erreur technique IA — escalade automatique'
          );
        } catch (errEscalade) {
          console.error('Erreur escalade :', errEscalade.message);
        }
        reponse = `Je rencontre un petit souci technique. Laissez-moi transférer votre demande à un conseiller SMG 😊`;
      }

      // Si 2 incompréhensions de suite → escalade vers l'admin
      if (incomprehensions[numeroClient] >= 2) {
        incomprehensions[numeroClient] = 0;
        try {
          await escalade.transfererAdmin(
            numeroClient,
            message,
            ctx.historique,
            '2 incompréhensions consécutives'
          );
        } catch (errEscalade) {
          console.error('Erreur escalade :', errEscalade.message);
        }
        reponse = reponses.escaladeMessage();
      } else if (!reponse) {
        reponse = reponses.incomprehension(incomprehensions[numeroClient]);
      }
      break;
  }

  // Ajouter la réponse du bot à l'historique
  ctx.historique.push({ role: 'assistant', content: reponse });

  return reponse;
}

module.exports = { traiterMessage };
