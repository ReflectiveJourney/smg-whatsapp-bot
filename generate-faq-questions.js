const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat
} = require("docx");

// Couleurs
const BLUE = "1B4F72";
const LIGHT_BLUE = "D6EAF8";
const ORANGE = "E67E22";
const DARK = "2C3E50";
const GRAY = "7F8C8D";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F2F3F4";

// ===================== FONCTIONS UTILITAIRES =====================

function titrePrincipal(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: BLUE })],
  });
}

function sousTitre(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ORANGE })],
  });
}

function questionBlock(numero, text) {
  return new Paragraph({
    spacing: { before: 250, after: 80 },
    children: [
      new TextRun({ text: `Q${numero}. `, bold: true, font: "Arial", size: 22, color: ORANGE }),
      new TextRun({ text, bold: true, font: "Arial", size: 22, color: DARK }),
    ],
  });
}

function ligneReponse() {
  return new Paragraph({
    spacing: { before: 60, after: 20 },
    children: [
      new TextRun({ text: "Réponse : ", bold: true, font: "Arial", size: 20, color: GRAY }),
      new TextRun({ text: "_______________________________________________________________", font: "Arial", size: 20, color: GRAY }),
    ],
  });
}

function ligneVide() {
  return new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({ text: "________________________________________________________________________", font: "Arial", size: 20, color: LIGHT_GRAY }),
    ],
  });
}

function espaceReponse() {
  return [
    ligneReponse(),
    ligneVide(),
    ligneVide(),
    new Paragraph({ spacing: { before: 0, after: 200 }, children: [] }),
  ];
}

function instruction(text) {
  return new Paragraph({
    spacing: { before: 100, after: 200 },
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    children: [
      new TextRun({ text: "💡 ", font: "Arial", size: 20 }),
      new TextRun({ text, italics: true, font: "Arial", size: 20, color: BLUE }),
    ],
  });
}

function separateur() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LIGHT_BLUE, space: 1 } },
    children: [],
  });
}

// ===================== CONTENU DES QUESTIONS =====================

function creerQuestions() {
  let q = 0; // compteur global de questions

  const sections = [];

  // ==================== SECTION 1 : INFORMATIONS GÉNÉRALES ====================
  sections.push(titrePrincipal("📋 SECTION 1 — INFORMATIONS GÉNÉRALES SUR SMG"));
  sections.push(instruction("Ces informations permettront au bot de se présenter correctement aux clients."));

  const questionsGenerales = [
    "Quel est le nom complet de l'agence ?",
    "Quelle est l'adresse physique de l'agence (ville, quartier, repère) ?",
    "Quels sont les horaires d'ouverture ? (Lundi à Vendredi, Samedi, Dimanche)",
    "Quels sont les numéros de téléphone de l'agence ? (WhatsApp, fixe, etc.)",
    "Quelle est l'adresse email de l'agence ?",
    "L'agence a-t-elle un site web ? Si oui, lequel ?",
    "L'agence a-t-elle des pages sur les réseaux sociaux ? (Facebook, Instagram, etc.)",
    "Depuis combien d'années l'agence existe-t-elle ?",
    "L'agence est-elle agréée / certifiée ? (numéro de licence, affiliations IATA, etc.)",
    "Quel est le slogan ou la devise de l'agence ?",
  ];

  questionsGenerales.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 2 : DESTINATIONS ====================
  sections.push(separateur());
  sections.push(titrePrincipal("✈️ SECTION 2 — DESTINATIONS"));
  sections.push(instruction("Listez TOUTES les destinations que vous proposez. Pour chaque destination, répondez aux questions ci-dessous. Vous pouvez photocopier cette section pour chaque destination."));

  sections.push(sousTitre("2.1 — Liste des destinations"));
  q++;
  sections.push(questionBlock(q, "Quelles sont TOUTES les destinations que vous proposez au départ d'Abidjan ?"));
  sections.push(instruction("Listez chaque ville et pays. Exemple : Paris (France), Dubai (EAU), Istanbul (Turquie)..."));
  sections.push(...espaceReponse());
  sections.push(...espaceReponse());

  sections.push(sousTitre("2.2 — Détails par destination"));
  sections.push(instruction("⚠️ Répondez à ces questions pour CHAQUE destination. Copiez-collez ce bloc autant de fois que nécessaire."));

  const questionsDestination = [
    "Nom de la destination (ville + pays) :",
    "Quel est le prix du billet d'avion aller-retour en FCFA ? (économie)",
    "Quel est le prix en classe Business (si disponible) ?",
    "Le prix inclut-il l'hébergement ? Si oui, combien de nuits et quel type d'hôtel ?",
    "Quels éléments sont INCLUS dans le prix ? (vol, hôtel, transfert aéroport, assurance, etc.)",
    "Quels éléments NE SONT PAS inclus ? (visa, repas, excursions, etc.)",
    "Quelle est la durée du séjour proposé ?",
    "Quelles sont les dates de départ disponibles ? (prochains départs)",
    "Y a-t-il des départs réguliers (chaque mois) ou seulement à certaines périodes ?",
    "Combien de places restantes pour le prochain départ ?",
    "Quelle compagnie aérienne est utilisée pour cette destination ?",
    "Y a-t-il des escales ? Si oui, où et combien de temps ?",
    "Proposez-vous des packages spéciaux pour cette destination ? (lune de miel, famille, groupe...)",
  ];

  questionsDestination.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 3 : VISA ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🛂 SECTION 3 — VISA & DOCUMENTS"));
  sections.push(instruction("Répondez pour chaque destination. Si vous aidez les clients avec le visa, précisez votre service."));

  const questionsVisa = [
    "Pour quelles destinations un visa est-il nécessaire pour les Ivoiriens ?",
    "Pour quelles destinations le visa n'est PAS nécessaire ?",
    "Pour chaque destination nécessitant un visa, quel est le coût du visa ?",
    "Quels documents faut-il fournir pour la demande de visa ? (par destination)",
    "Combien de temps prend l'obtention du visa ? (délai moyen par destination)",
    "L'agence aide-t-elle les clients dans les démarches de visa ? Si oui, quel est le coût de ce service ?",
    "Où doit-on déposer la demande de visa ? (ambassade, centre VFS, en ligne...)",
    "Y a-t-il des destinations avec visa à l'arrivée ou e-visa ?",
    "Quels sont les documents de voyage obligatoires en dehors du visa ? (passeport valide combien de mois, carnet de vaccination, etc.)",
  ];

  questionsVisa.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 4 : RÉSERVATION & PAIEMENT ====================
  sections.push(separateur());
  sections.push(titrePrincipal("💳 SECTION 4 — RÉSERVATION & PAIEMENT"));

  const questionsReservation = [
    "Comment un client peut-il réserver ? (en agence, par téléphone, par WhatsApp, en ligne...)",
    "Quels sont les modes de paiement acceptés ? (espèces, virement, Orange Money, MTN Money, Wave, Moov Money, carte bancaire, chèque...)",
    "Faut-il verser un acompte pour réserver ? Si oui, quel montant ou pourcentage ?",
    "Quel est le délai pour payer le solde après l'acompte ?",
    "Le paiement en plusieurs fois est-il possible ? Si oui, en combien de fois et quelles conditions ?",
    "À quel numéro doit-on envoyer le paiement Mobile Money ? (Orange, MTN, Wave, Moov)",
    "Le client reçoit-il une confirmation après le paiement ? Sous quelle forme ? (SMS, WhatsApp, email, reçu papier)",
    "Quels documents le client reçoit-il après la réservation ? (billet électronique, voucher hôtel, programme...)",
    "Y a-t-il des frais de dossier ? Si oui, combien ?",
    "Le client peut-il réserver pour quelqu'un d'autre ? Quelles informations sont nécessaires ?",
  ];

  questionsReservation.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 5 : ANNULATION & MODIFICATION ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🔄 SECTION 5 — ANNULATION & MODIFICATION"));

  const questionsAnnulation = [
    "Le client peut-il annuler sa réservation ? Si oui, dans quel délai ?",
    "Y a-t-il des frais d'annulation ? Quel montant ou pourcentage ?",
    "L'acompte est-il remboursable en cas d'annulation ?",
    "Le client peut-il modifier la date de son voyage ? Dans quel délai et à quel coût ?",
    "Le client peut-il changer de destination après avoir réservé ?",
    "Que se passe-t-il si le vol est annulé par la compagnie aérienne ?",
    "Que se passe-t-il si le client ne peut pas voyager pour raison médicale ?",
    "Proposez-vous une assurance annulation ? À quel prix ?",
  ];

  questionsAnnulation.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 6 : BAGAGES ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🧳 SECTION 6 — BAGAGES"));

  const questionsBagages = [
    "Quel est le poids de bagage autorisé en soute ? (en général et par compagnie si différent)",
    "Quel est le poids du bagage cabine autorisé ?",
    "Combien coûte un excédent de bagage ? (par kg ou par tranche)",
    "Peut-on acheter un bagage supplémentaire à l'avance ? À quel prix ?",
    "Quels objets sont interdits en cabine ?",
    "Quels objets sont interdits en soute ?",
    "Que faire si un bagage est perdu ou endommagé ?",
    "Y a-t-il des restrictions spéciales pour certaines destinations ?",
  ];

  questionsBagages.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 7 : HÉBERGEMENT ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🏨 SECTION 7 — HÉBERGEMENT"));

  const questionsHebergement = [
    "Les packages incluent-ils l'hébergement ?",
    "Quel type d'hôtel proposez-vous ? (nombre d'étoiles, catégorie)",
    "Le client peut-il choisir son hôtel ou changer de catégorie ? À quel coût supplémentaire ?",
    "Le petit-déjeuner est-il inclus ?",
    "Quels sont les horaires de check-in et check-out habituels ?",
    "Le transfert aéroport-hôtel est-il inclus ?",
    "Proposez-vous des hébergements alternatifs ? (appartement, Airbnb, etc.)",
  ];

  questionsHebergement.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 8 : SANTÉ & ASSURANCE ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🏥 SECTION 8 — SANTÉ & ASSURANCE"));

  const questionsSante = [
    "Proposez-vous une assurance voyage ? Si oui, que couvre-t-elle et à quel prix ?",
    "L'assurance est-elle obligatoire ou optionnelle ?",
    "Quels vaccins sont recommandés ou obligatoires selon les destinations ?",
    "Le carnet de vaccination (fièvre jaune) est-il exigé pour toutes les destinations ?",
    "Que conseillez-vous aux clients concernant les médicaments à emporter ?",
    "En cas de problème de santé pendant le voyage, qui le client doit-il contacter ?",
    "Y a-t-il un numéro d'urgence SMG disponible pendant le voyage ?",
  ];

  questionsSante.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 9 : PROGRAMMES SPÉCIAUX ====================
  sections.push(separateur());
  sections.push(titrePrincipal("🎯 SECTION 9 — PROGRAMMES & OFFRES SPÉCIALES"));

  const questionsSpeciaux = [
    "Proposez-vous des voyages de groupe ? À partir de combien de personnes ? Y a-t-il une réduction ?",
    "Proposez-vous des packages lune de miel ? Pour quelles destinations et à quel prix ?",
    "Proposez-vous des voyages organisés (Omra, Hadj, pèlerinage) ? Détails et prix ?",
    "Proposez-vous des voyages scolaires ou éducatifs ?",
    "Proposez-vous des voyages d'affaires / séminaires ?",
    "Y a-t-il des promotions en cours ? Si oui, lesquelles ?",
    "Y a-t-il des réductions pour les enfants ? À partir de quel âge et quel pourcentage ?",
    "Y a-t-il un programme de fidélité ? Comment ça fonctionne ?",
    "Proposez-vous des cartes cadeaux ou des bons de voyage ?",
    "Y a-t-il des offres spéciales pendant certaines périodes ? (Noël, été, fêtes, etc.)",
  ];

  questionsSpeciaux.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 10 : SUIVI CLIENT ====================
  sections.push(separateur());
  sections.push(titrePrincipal("📞 SECTION 10 — SUIVI & SERVICE CLIENT"));

  const questionsSuivi = [
    "Comment le client peut-il suivre l'état de sa réservation / son dossier ?",
    "Y a-t-il un numéro de dossier attribué au client ? Comment le retrouver ?",
    "Le client reçoit-il des rappels avant le voyage ? (par SMS, WhatsApp, email ?)",
    "Qui contacter en cas de problème avant le départ ?",
    "Qui contacter en cas de problème PENDANT le voyage ?",
    "Y a-t-il un service client disponible en dehors des heures d'ouverture ?",
    "Le client peut-il laisser un avis ou une réclamation ? Comment ?",
    "Combien de temps faut-il pour traiter une réclamation ?",
  ];

  questionsSuivi.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // ==================== SECTION 11 : DIVERS ====================
  sections.push(separateur());
  sections.push(titrePrincipal("❓ SECTION 11 — QUESTIONS DIVERSES"));

  const questionsDivers = [
    "Quels conseils donnez-vous aux voyageurs qui prennent l'avion pour la première fois ?",
    "Quels sont les documents à avoir sur soi le jour du départ ?",
    "Combien de temps avant le vol le client doit-il être à l'aéroport ?",
    "L'agence propose-t-elle un accompagnement à l'aéroport ?",
    "Y a-t-il des services supplémentaires payants ? (accueil VIP, fast-track, etc.)",
    "Le client peut-il acheter uniquement un billet d'avion (sans package) ?",
    "Proposez-vous des excursions ou activités sur place ? Lesquelles et à quel prix ?",
    "Y a-t-il autre chose que vous aimeriez que le bot communique aux clients ?",
  ];

  questionsDivers.forEach(qt => {
    q++;
    sections.push(questionBlock(q, qt));
    sections.push(...espaceReponse());
  });

  // Note finale
  sections.push(separateur());
  sections.push(new Paragraph({
    spacing: { before: 400, after: 200 },
    shading: { fill: "FEF9E7", type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    children: [
      new TextRun({ text: "📌 IMPORTANT : ", bold: true, font: "Arial", size: 22, color: ORANGE }),
      new TextRun({ text: `Ce document contient ${q} questions. Prenez le temps de répondre à chacune. Plus vos réponses seront complètes, plus le bot WhatsApp sera performant et utile pour vos clients ! N'hésitez pas à ajouter des informations supplémentaires en bas du document.`, font: "Arial", size: 22, color: DARK }),
    ],
  }));

  sections.push(new Paragraph({
    spacing: { before: 200, after: 400 },
    children: [
      new TextRun({ text: "Merci pour votre collaboration ! 🙏", bold: true, font: "Arial", size: 24, color: BLUE }),
    ],
  }));

  return { sections, totalQuestions: q };
}

// ===================== GÉNÉRATION DU DOCUMENT =====================

async function genererDocument() {
  const { sections, totalQuestions } = creerQuestions();

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial" },
          paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      ]
    },
    numbering: {
      config: [
        { reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "SMG — QUESTIONNAIRE FAQ POUR LE BOT WHATSAPP", bold: true, font: "Arial", size: 18, color: BLUE }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GRAY }),
              new TextRun({ text: " — SMG Voyages — Confidentiel", font: "Arial", size: 16, color: GRAY }),
            ],
          })],
        }),
      },
      children: [
        // Page de titre
        new Paragraph({ spacing: { before: 2000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "SMG VOYAGES", bold: true, font: "Arial", size: 52, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "Agence de Voyage — Cote d'Ivoire", font: "Arial", size: 28, color: GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: ORANGE }, bottom: { style: BorderStyle.SINGLE, size: 3, color: ORANGE } },
          children: [new TextRun({ text: "QUESTIONNAIRE FAQ", bold: true, font: "Arial", size: 36, color: ORANGE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Pour alimenter le Bot WhatsApp", font: "Arial", size: 24, color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: `${totalQuestions} questions reparties en 11 sections`, italics: true, font: "Arial", size: 22, color: GRAY })],
        }),

        // Instructions
        new Paragraph({
          spacing: { before: 200, after: 100 },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "📋 COMMENT REMPLIR CE DOCUMENT ?", bold: true, font: "Arial", size: 24, color: BLUE })],
        }),
        new Paragraph({
          spacing: { before: 100, after: 60 },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "1. Lisez chaque question attentivement", font: "Arial", size: 22, color: DARK })],
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "2. Ecrivez votre reponse sur les lignes prevues (vous pouvez agrandir l'espace)", font: "Arial", size: 22, color: DARK })],
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "3. Si une question ne s'applique pas, ecrivez \"Non applicable\"", font: "Arial", size: 22, color: DARK })],
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "4. Pour la section Destinations, copiez le bloc pour chaque destination", font: "Arial", size: 22, color: DARK })],
        }),
        new Paragraph({
          spacing: { before: 60, after: 300 },
          indent: { left: 300, right: 300 },
          children: [new TextRun({ text: "5. Soyez le plus precis possible — chaque detail aide le bot a mieux repondre !", font: "Arial", size: 22, color: DARK })],
        }),

        // Toutes les sections de questions
        ...sections,
      ],
    }],
  });

  const outputPath = process.argv[2] || "FAQ_SMG_Questions.docx";
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`OK: ${outputPath}`);
  console.log(`Total: ${totalQuestions} questions`);
}

genererDocument().catch(err => {
  console.error("Erreur:", err);
  process.exit(1);
});
