const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents
} = require("docx");

// Colors
const BLUE = "1B4F72";
const LIGHT_BLUE = "D6EAF8";
const ORANGE = "E67E22";
const DARK = "2C3E50";
const GRAY = "7F8C8D";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F2F3F4";

function title(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: BLUE })],
  });
}

function subtitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ORANGE })],
  });
}

function question(text) {
  return new Paragraph({
    spacing: { before: 250, after: 80 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: DARK })],
  });
}

function answer(text) {
  return new Paragraph({
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: "333333" })],
  });
}

function tip(text) {
  return new Paragraph({
    spacing: { before: 60, after: 180 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "Conseil SMG : ", bold: true, font: "Arial", size: 20, color: ORANGE }),
      new TextRun({ text, italics: true, font: "Arial", size: 20, color: GRAY }),
    ],
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 1 } },
    children: [new TextRun({ text: "", font: "Arial", size: 4 })],
  });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function visaTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 1560, 1560, 1560, 1170, 1170],
    rows: [
      new TableRow({
        children: ["Destination", "Visa requis", "Type", "Delai", "Cout FCFA", "Depot"].map(h =>
          new TableCell({
            borders,
            width: { size: h === "Destination" ? 2340 : h === "Depot" || h === "Cout FCFA" ? 1170 : 1560, type: WidthType.DXA },
            shading: { fill: BLUE, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: "Arial", size: 18, color: WHITE })] })],
          })
        ),
      }),
      ...rows.map((row, i) =>
        new TableRow({
          children: row.map((cell, j) =>
            new TableCell({
              borders,
              width: { size: j === 0 ? 2340 : j >= 4 ? 1170 : 1560, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 80, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 18 })] })],
            })
          ),
        })
      ),
    ],
  });
}

// Build document
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ORANGE },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [
    // COVER PAGE
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "SMG Voyages - FAQ Complete", font: "Arial", size: 16, color: GRAY, italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "SMG Voyages - Abidjan, Cote d'Ivoire | Page ", font: "Arial", size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GRAY }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "SMG VOYAGES", bold: true, font: "Arial", size: 56, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Votre partenaire voyage en Cote d'Ivoire", font: "Arial", size: 28, color: ORANGE, italics: true })],
        }),
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: BLUE, space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 3, color: BLUE, space: 8 } },
          children: [new TextRun({ text: "FAQ COMPLETE", bold: true, font: "Arial", size: 44, color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Guide complet pour les voyageurs", font: "Arial", size: 26, color: GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Base de donnees du Bot WhatsApp SMG", font: "Arial", size: 22, color: GRAY })],
        }),
        new Paragraph({ spacing: { before: 2000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Document interne - Avril 2026", font: "Arial", size: 20, color: GRAY, italics: true })],
        }),

        // PAGE BREAK
        new Paragraph({ children: [new PageBreak()] }),

        // TABLE OF CONTENTS
        new Paragraph({
          spacing: { after: 400 },
          children: [new TextRun({ text: "TABLE DES MATIERES", bold: true, font: "Arial", size: 32, color: BLUE })],
        }),
        new TableOfContents("Table des matieres", { hyperlink: true, headingStyleRange: "1-2" }),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 1. RESERVATION & PAIEMENT
        // ==========================================
        title("1. RESERVATION & PAIEMENT"),

        question("Comment reserver un voyage avec SMG ?"),
        answer("Vous pouvez reserver de plusieurs facons : 1) Via notre bot WhatsApp en tapant 'Reserver' et en suivant les etapes. 2) En vous rendant dans nos bureaux a Abidjan. 3) En appelant notre service client. Le processus comprend : choix de la destination, selection de la date, nombre de voyageurs, fourniture de vos coordonnees, puis confirmation par un conseiller sous 30 minutes."),
        tip("Reservez au moins 3 semaines avant le depart pour avoir les meilleurs tarifs et le temps de preparer les documents."),
        separator(),

        question("Quels modes de paiement acceptez-vous ?"),
        answer("SMG accepte les modes de paiement suivants : Orange Money, MTN Money, Moov Money, Wave (les plus utilises en Cote d'Ivoire), virement bancaire (BCEAO, toutes banques ivoiriennes), especes dans nos bureaux a Abidjan, et paiement par carte bancaire Visa/Mastercard pour les paiements en ligne."),
        tip("Le paiement par Mobile Money est le plus rapide. Vous recevez une confirmation instantanee par WhatsApp."),
        separator(),

        question("Peut-on payer en plusieurs fois ?"),
        answer("Oui, SMG propose le paiement echelonne : en 2 fois (50% a la reservation, 50% au moins 15 jours avant le depart) ou en 3 fois (40% a la reservation, 30% a mi-parcours, 30% au moins 15 jours avant le depart). Le paiement echelonne est disponible pour les voyages de plus de 500 000 FCFA. Contactez un conseiller pour les modalites."),
        tip("Le premier versement confirme votre reservation et bloque le prix. Sans versement dans les 48h, la reservation est annulee."),
        separator(),

        question("Quel est le delai de confirmation apres la reservation ?"),
        answer("Apres votre demande de reservation, un conseiller SMG vous contacte sous 30 minutes (pendant les heures de bureau : 8h-18h, lundi-samedi). La confirmation definitive est envoyee par WhatsApp et email sous 24 heures apres le paiement du premier versement."),
        separator(),

        question("Comment reserver pour un groupe ?"),
        answer("Pour les groupes de 5 personnes et plus, SMG propose des tarifs preferentiels. Contactez directement un conseiller en tapant 'Conseiller' sur le bot WhatsApp. Nous proposons des reductions allant jusqu'a 15% pour les groupes de 10+ personnes. Les voyages de groupe incluent un accompagnateur SMG gratuit a partir de 15 personnes."),
        tip("Les reservations de groupe doivent etre faites au moins 6 semaines a l'avance."),
        separator(),

        question("Peut-on reserver pour quelqu'un d'autre ?"),
        answer("Oui, vous pouvez reserver pour un tiers. Vous aurez besoin de : nom complet du voyageur (tel que sur le passeport), date de naissance, numero de passeport, numero de telephone du voyageur. Le paiement peut etre effectue par une personne differente du voyageur."),
        separator(),

        question("Comment modifier une reservation ?"),
        answer("Pour modifier une reservation (date, destination, nombre de voyageurs), contactez un conseiller SMG le plus tot possible. Modifications gratuites si faites plus de 21 jours avant le depart. Frais de 25 000 FCFA si entre 7 et 21 jours avant le depart. Aucune modification possible moins de 7 jours avant le depart."),
        separator(),

        question("Quelles sont les conditions d'annulation et de remboursement ?"),
        answer("Conditions d'annulation : plus de 30 jours avant le depart = remboursement a 80%. Entre 15 et 30 jours = remboursement a 50%. Moins de 15 jours = aucun remboursement. En cas de force majeure (maladie grave avec certificat medical, deces d'un proche), SMG etudie chaque cas individuellement. Le remboursement est effectue sous 15 jours ouvrables par le meme moyen de paiement."),
        tip("Souscrivez a l'assurance annulation SMG (15 000 FCFA) pour etre rembourse a 100% en cas d'imprevus."),
        separator(),

        question("Quels sont les tarifs pour les enfants et bebes ?"),
        answer("Enfants de 2 a 11 ans : reduction de 25% a 50% selon la destination et la compagnie aerienne. Bebes de 0 a 2 ans (sans siege) : forfait fixe de 50 000 a 100 000 FCFA selon la destination (pas de siege attribue, sur les genoux du parent). Enfants de 12 ans et plus : tarif adulte. Un enfant de moins de 15 ans doit obligatoirement voyager accompagne d'un adulte ou avoir une autorisation parentale."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 2. DOCUMENTS DE VOYAGE
        // ==========================================
        title("2. DOCUMENTS DE VOYAGE"),

        question("Quels documents sont necessaires pour voyager ?"),
        answer("Les documents essentiels sont : un passeport valide (6 mois minimum apres la date de retour), un visa si requis pour la destination, un billet d'avion (e-ticket), une assurance voyage, un carnet de vaccination (fievre jaune obligatoire pour de nombreuses destinations depuis l'Afrique), et une preuve d'hebergement (reservation d'hotel)."),
        separator(),

        question("Comment obtenir ou renouveler un passeport ivoirien ?"),
        answer("Pour obtenir un passeport biometrique ivoirien : rendez-vous sur le site de l'ONECI (Office National de l'Etat Civil et de l'Identification) ou dans un centre de collecte. Documents requis : certificat de nationalite, extrait d'acte de naissance, 4 photos d'identite, ancien passeport (si renouvellement). Cout : 100 000 FCFA (passeport ordinaire de 32 pages) ou 150 000 FCFA (48 pages). Delai : 2 a 4 semaines en procedure normale, 1 semaine en procedure d'urgence (cout supplementaire)."),
        tip("Verifiez la validite de votre passeport des que vous pensez a voyager. Le renouvellement prend du temps."),
        separator(),

        question("L'assurance voyage est-elle obligatoire ?"),
        answer("L'assurance voyage de base est incluse dans tous les forfaits SMG. Elle couvre les frais medicaux a l'etranger (jusqu'a 30 000 euros), le rapatriement sanitaire, et la perte de bagages. Pour certaines destinations (espace Schengen), une assurance couvrant 30 000 euros minimum est OBLIGATOIRE pour obtenir le visa. SMG propose aussi une assurance premium (35 000 FCFA) qui ajoute : annulation voyage, retard de vol, responsabilite civile."),
        separator(),

        question("Qu'est-ce que le carnet de vaccination ?"),
        answer("Le carnet international de vaccination (carnet jaune de l'OMS) est un document officiel qui prouve que vous avez recu certains vaccins. Le vaccin contre la fievre jaune est le plus demande pour les voyageurs partant d'Afrique. Il est obligatoire pour entrer dans de nombreux pays et est souvent controle a l'embarquement. Le vaccin se fait dans les centres agrees (Institut National d'Hygiene Publique d'Abidjan). Cout : environ 10 000 FCFA. Le certificat est valable a vie apres une seule dose."),
        separator(),

        question("Comment fonctionne le e-ticket (billet electronique) ?"),
        answer("Le e-ticket est votre billet d'avion au format electronique. Vous le recevrez par email et WhatsApp apres confirmation de votre reservation. Il contient votre numero de reservation (PNR), vos horaires de vol, et les informations de la compagnie aerienne. Vous pouvez l'imprimer ou le garder sur votre telephone. A l'aeroport, donnez simplement votre nom ou numero de reservation au comptoir d'enregistrement."),
        tip("Sauvegardez toujours une copie de votre e-ticket hors ligne (screenshot) en cas de probleme de connexion a l'aeroport."),
        separator(),

        question("Qu'est-ce qu'une lettre d'invitation ?"),
        answer("Certains pays demandent une lettre d'invitation pour accorder un visa. C'est une lettre officielle d'une personne ou entreprise dans le pays de destination qui confirme qu'elle vous invite et prend en charge certains frais. SMG peut vous aider a obtenir une lettre d'invitation de nos partenaires hoteliers pour faciliter votre demande de visa."),
        separator(),

        question("Pourquoi me demande-t-on un releve bancaire ?"),
        answer("Le releve bancaire prouve que vous avez les moyens financiers de subvenir a vos besoins pendant le voyage. Il est demande pour la plupart des visas. Generalement, on demande les 3 a 6 derniers mois. Le solde minimum attendu varie : Schengen = environ 50 euros/jour, USA = pas de montant fixe mais un solde confortable. Demandez-le a votre banque au moins 1 semaine avant votre rendez-vous visa."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 3. VOL & AEROPORT
        // ==========================================
        title("3. VOL & AEROPORT"),

        question("Quelles informations sur l'aeroport d'Abidjan ?"),
        answer("L'Aeroport International Felix Houphouet-Boigny (code : ABJ) est situe a Port-Bouet, Abidjan. C'est le principal aeroport de Cote d'Ivoire. Il dispose d'un terminal international renove. Services disponibles : boutiques duty-free, restaurants, bureau de change, salon VIP, Wi-Fi gratuit. Acces : taxi depuis le centre-ville (30-45 min, 5 000-10 000 FCFA), ou VTC (Uber, Yango)."),
        separator(),

        question("Comment faire l'enregistrement ?"),
        answer("Deux options : 1) Enregistrement en ligne : disponible 24-48h avant le vol sur le site de la compagnie aerienne. Vous recevez votre carte d'embarquement par email. 2) Enregistrement au comptoir : rendez-vous au comptoir de la compagnie avec votre passeport et e-ticket. Les comptoirs ouvrent generalement 3h avant le vol et ferment 1h avant."),
        tip("L'enregistrement en ligne vous fait gagner du temps et vous permet de choisir votre siege."),
        separator(),

        question("A quelle heure dois-je arriver a l'aeroport ?"),
        answer("Pour un vol international : arrivez au moins 3 heures avant l'heure de depart. Cela laisse le temps pour : l'enregistrement, le controle de securite, le controle de passeport et le passage en zone d'embarquement. Pour les periodes de pointe (vacances, fetes), prevoyez 3h30 a 4h."),
        separator(),

        question("Comment fonctionnent les escales et correspondances ?"),
        answer("Une escale est un arret intermediaire avant votre destination finale. Votre bagage est generalement transfere automatiquement. Lors d'une correspondance, vous devez changer d'avion. Verifiez que vous avez assez de temps entre les vols (minimum 2h recommande, 3h dans les grands aeroports). Si vous avez un visa de transit, vous pouvez sortir de l'aeroport pendant l'escale (selon les pays). SMG choisit toujours les correspondances avec un temps suffisant."),
        separator(),

        question("Que faire en cas de retard ou annulation de vol ?"),
        answer("En cas de retard : la compagnie doit vous informer. Si le retard depasse 3h, vous pouvez avoir droit a une compensation, des repas, et un hebergement. En cas d'annulation : la compagnie doit vous proposer un reacheminement ou un remboursement. Contactez immediatement SMG (via WhatsApp) pour que nous vous assistions dans vos demarches. Gardez tous les recus de depenses imprevues."),
        tip("Prenez une assurance voyage qui couvre les retards et annulations de vol."),
        separator(),

        question("Peut-on se faire surclasser ?"),
        answer("Le surclassement (passer en classe Business ou Premiere) est possible de plusieurs facons : au moment de la reservation (supplement tarifaire variable), a l'aeroport (si des places sont disponibles, parfois propose au comptoir), via les miles/points fidelite de la compagnie. Le cout du surclassement depend de la compagnie et de la destination. Contactez SMG pour un devis."),
        separator(),

        question("Y a-t-il des repas a bord ?"),
        answer("Sur les vols long-courrier (plus de 4h) : un ou deux repas complets sont generalement inclus, plus des boissons. Sur les vols court-courrier (moins de 4h) : collation legere ou service payant selon la compagnie. Repas speciaux (halal, vegetarien, sans gluten) : a demander au moins 48h avant le vol. SMG peut faire cette demande pour vous."),
        separator(),

        question("Quelles compagnies aeriennes desservent Abidjan ?"),
        answer("Les principales compagnies au depart d'Abidjan : Air France (Paris direct), Turkish Airlines (Istanbul direct), Emirates (Dubai via Accra), Ethiopian Airlines (Addis-Abeba, hub vers Asie/Amerique), Royal Air Maroc (Casablanca, hub vers Europe), Air Cote d'Ivoire (Afrique de l'Ouest), ASKY Airlines (Afrique), Corsair (Paris), Kenya Airways (Nairobi)."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 4. BAGAGES
        // ==========================================
        title("4. BAGAGES"),

        question("Quel poids de bagage est autorise ?"),
        answer("En general : Bagage cabine = 1 sac de 7 a 10 kg (selon la compagnie), dimensions max 55x35x25 cm. Bagage soute = 1 valise de 23 kg (classe economique), 2 valises de 32 kg (classe Business). Ces poids varient selon la compagnie aerienne. SMG vous communiquera les limites exactes avec votre billet."),
        separator(),

        question("Quels objets sont interdits en cabine ?"),
        answer("Objets interdits en cabine : liquides de plus de 100 ml (sauf dans un sac plastique transparent de 1 litre max), couteaux et objets tranchants, briquets et allumettes, batteries au lithium non protegees. Objets interdits en soute ET cabine : explosifs, armes, substances inflammables, drogues. Autorise en soute uniquement : liquides de plus de 100 ml, couteaux, outils."),
        tip("Mettez vos liquides (parfum, creme, dentifrice) dans un sac plastique transparent pour le controle de securite."),
        separator(),

        question("Combien coute un bagage supplementaire ?"),
        answer("Le cout d'un bagage supplementaire varie selon la compagnie : Air France = environ 70-200 euros, Turkish Airlines = 30-60 euros, Emirates = 45-100 euros, Ethiopian Airlines = 40-80 euros. Il est toujours moins cher de payer le bagage supplementaire en ligne (lors de l'enregistrement) qu'au comptoir de l'aeroport. SMG peut ajouter un bagage supplementaire a votre reservation."),
        separator(),

        question("Que faire si mon bagage est perdu ou endommage ?"),
        answer("Si votre bagage n'arrive pas : allez immediatement au comptoir 'Bagages' de la compagnie aerienne, remplissez une declaration PIR (Property Irregularity Report), gardez votre recu de bagage (etiquette collee sur votre carte d'embarquement). La compagnie a 21 jours pour retrouver votre bagage. Si endommage : signalez-le avant de quitter l'aeroport. Remplissez un formulaire de reclamation. L'assurance SMG couvre la perte de bagages jusqu'a 1 000 euros."),
        separator(),

        question("Peut-on transporter des objets speciaux ?"),
        answer("Instruments de musique : generalement acceptes en cabine s'ils ne depassent pas les dimensions. Sinon, achetez un siege supplementaire. Materiel sportif (velo, surf, ski, clubs de golf) : possible en soute avec supplement (30-100 euros selon la compagnie). Reservez a l'avance. Equipement medical : autorise en cabine avec un certificat medical. Prevoyez un justificatif."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 5. HEBERGEMENT
        // ==========================================
        title("5. HEBERGEMENT"),

        question("Quels types d'hebergement propose SMG ?"),
        answer("SMG propose : Hotels (2 a 5 etoiles selon votre budget et la destination), Riads (maisons traditionnelles au Maroc, charme et authenticite), Appartements (ideaux pour les familles et longs sejours), Resorts all-inclusive (tout compris avec repas et activites). Le type d'hebergement est inclus dans chaque forfait. Des surclassements sont possibles moyennant un supplement."),
        separator(),

        question("Que signifient les etoiles des hotels ?"),
        answer("Le classement par etoiles indique le niveau de confort : 2 etoiles = basique mais propre, chambre simple avec salle de bain privee. 3 etoiles = confortable, avec restaurant, Wi-Fi, menage quotidien (inclus dans les forfaits SMG standards). 4 etoiles = superieur, avec piscine, room service, spa. 5 etoiles = luxe, service premium, restaurants gastronomiques, concierge. Attention : les standards varient selon les pays. Un 3 etoiles a Dubai peut etre equivalent a un 4 etoiles en Afrique."),
        separator(),

        question("Quels sont les horaires de check-in et check-out ?"),
        answer("Horaires standards : Check-in (arrivee) = a partir de 14h00. Check-out (depart) = avant 12h00. Si votre vol arrive tot le matin, vous pouvez demander un early check-in (arrivee anticipee) a SMG. Si votre vol part tard le soir, un late check-out (depart tardif) peut etre negocie. Ces services sont parfois gratuits, parfois payants (20 000-50 000 FCFA) selon l'hotel."),
        tip("Informez SMG de vos horaires de vol pour que nous negocions les meilleurs arrangements avec l'hotel."),
        separator(),

        question("Quels services sont generalement inclus ?"),
        answer("Dans les forfaits SMG standards (3 etoiles) : petit-dejeuner quotidien, Wi-Fi gratuit, menage quotidien, serviettes et articles de toilette, coffre-fort dans la chambre. Non inclus generalement : dejeuner et diner, minibar, blanchisserie, spa, excursions. Les forfaits 4-5 etoiles incluent souvent la demi-pension (petit-dejeuner + diner)."),
        separator(),

        question("Peut-on faire des demandes speciales ?"),
        answer("Oui, voici les demandes les plus courantes : lit bebe (gratuit, a demander a l'avance), chambre communicante (deux chambres reliees, ideal pour les familles), chambre avec vue, regime alimentaire special, etage eleve ou bas, loin de l'ascenseur. Faites vos demandes au moment de la reservation. SMG les transmet a l'hotel mais elles restent soumises a disponibilite."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 6. VISA
        // ==========================================
        title("6. VISA (par destination)"),

        answer("Voici le tableau recapitulatif des visas pour les detenteurs d'un passeport ivoirien :"),
        new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }),

        visaTable([
          ["Paris (France)", "Oui", "Schengen", "15-21 jours", "55 000", "VFS Cocody"],
          ["Dubai (EAU)", "Oui", "Touristique", "3-5 jours", "45 000", "Via SMG"],
          ["Istanbul (Turquie)", "Oui", "E-Visa", "24-48h", "30 000", "En ligne"],
          ["Marrakech (Maroc)", "Non", "Exempt", "-", "0", "-"],
          ["Dakar (Senegal)", "Non", "CEDEAO", "-", "0", "-"],
          ["Johannesburg (AFS)", "Oui", "Touristique", "5-10 jours", "50 000", "Ambassade"],
          ["New York (USA)", "Oui", "B1/B2", "30-60 jours", "105 000", "Ambassade"],
          ["Bangkok (Thai)", "Oui", "E-Visa/VOA", "3-7 jours", "20 000", "En ligne"],
        ]),

        new Paragraph({ spacing: { before: 300 }, children: [] }),

        subtitle("Visa Schengen (France / Europe)"),
        question("Comment obtenir un visa Schengen pour la France ?"),
        answer("Le visa Schengen permet de visiter 27 pays europeens. Documents requis : passeport valide 6 mois (2 pages vierges), 2 photos d'identite recentes (fond blanc), formulaire de demande rempli, releve bancaire des 3 derniers mois, attestation de travail ou preuve d'activite, reservation hotel et billet d'avion, assurance voyage couvrant 30 000 euros minimum, justificatif de domicile. Depot : VFS Global Abidjan, Cocody Danga. Cout : 55 000 FCFA environ. Delai : 15 a 21 jours ouvres. Entretien possible au consulat."),
        tip("Prenez rendez-vous sur le site VFS Global des que possible. Les creneaux partent vite, surtout avant l'ete."),
        separator(),

        subtitle("Visa Dubai (EAU)"),
        question("Comment obtenir un visa pour Dubai ?"),
        answer("Le visa touristique 30 jours pour Dubai est relativement simple. Documents : passeport valide 6 mois, photo d'identite couleur, reservation hotel, billet d'avion retour. SMG peut s'occuper de toute la procedure pour vous (demarche en ligne). Cout : 45 000 FCFA. Delai : 3 a 5 jours ouvres. Pas d'entretien requis."),
        separator(),

        subtitle("E-Visa Turquie"),
        question("Comment obtenir un e-Visa pour la Turquie ?"),
        answer("Le e-Visa turc se fait entierement en ligne sur evisa.gov.tr. Procedure : remplissez le formulaire en ligne, payez par carte bancaire (environ 30 000 FCFA), recevez le visa par email en 24-48h, imprimez-le et presentez-le a l'arrivee. Simple et rapide. Validite : 30 jours, entree simple."),
        separator(),

        subtitle("Maroc - Pas de visa"),
        question("Faut-il un visa pour le Maroc ?"),
        answer("Bonne nouvelle ! Les ressortissants ivoiriens sont exemptes de visa pour le Maroc pour un sejour touristique de maximum 90 jours. Vous avez juste besoin de votre passeport valide 6 mois et de votre billet d'avion retour."),
        separator(),

        subtitle("Senegal - CEDEAO"),
        question("Faut-il un visa pour le Senegal ?"),
        answer("Non ! En tant que ressortissant d'un pays membre de la CEDEAO (Communaute Economique des Etats de l'Afrique de l'Ouest), vous beneficiez de la libre circulation. Un passeport valide ou meme une carte d'identite CEDEAO suffit. Aucune formalite supplementaire."),
        separator(),

        subtitle("Visa Afrique du Sud"),
        question("Comment obtenir un visa pour l'Afrique du Sud ?"),
        answer("Documents requis : passeport valide 6 mois (2 pages vierges), 2 photos d'identite, releve bancaire des 3 derniers mois, reservation hotel et billet retour, lettre d'invitation ou itineraire, preuve de fonds suffisants. Depot : Ambassade d'Afrique du Sud, Abidjan Cocody. Cout : 50 000 FCFA. Delai : 5 a 10 jours ouvres."),
        separator(),

        subtitle("Visa USA (B1/B2)"),
        question("Comment obtenir un visa americain ?"),
        answer("Le visa B1/B2 est le plus complexe. Etapes : remplir le formulaire DS-160 en ligne, payer les frais (105 000 FCFA), prendre rendez-vous a l'ambassade US d'Abidjan (Riviera), passer l'entretien avec un officier consulaire. Documents : passeport, photo aux normes US (5x5 cm), releves bancaires 6 mois, attestation de travail, preuve d'attaches au pays (propriete, famille, emploi stable). L'entretien est determinant. Delai total : 30 a 60 jours. Le refus est possible."),
        tip("Preparez bien votre entretien. L'officier veut s'assurer que vous reviendrez en Cote d'Ivoire. Montrez vos attaches (emploi, famille, biens)."),
        separator(),

        subtitle("Visa Thailande"),
        question("Comment obtenir un visa pour la Thailande ?"),
        answer("Deux options : E-Visa (avant le depart) = demande en ligne, 3-7 jours, 20 000 FCFA. Documents : passeport, photo, billet retour, preuve d'hebergement. Visa on Arrival (a l'arrivee) = possible pour certains sejours courts. Moins recommande car file d'attente longue. SMG recommande le e-Visa pour eviter les surprises a l'arrivee."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 7. SANTE & SECURITE
        // ==========================================
        title("7. SANTE & SECURITE"),

        question("Quels vaccins sont necessaires pour voyager ?"),
        answer("Fievre jaune : OBLIGATOIRE pour quitter la Cote d'Ivoire et entrer dans la plupart des pays. Certificat controle a l'embarquement. Vaccin a vie apres une dose (Institut National d'Hygiene Publique, Abidjan, environ 10 000 FCFA). Autres vaccins recommandes selon la destination : Hepatite A et B, Typhoide (Asie, Afrique), Tetanos, et verification que vos vaccins de base sont a jour."),
        separator(),

        question("Quels medicaments emporter ?"),
        answer("Trousse de base recommandee : paracetamol/ibuprofene, anti-diarrheique (Imodium), antihistaminique (allergies), pansements et desinfectant, creme solaire (SPF 30+), anti-moustiques (DEET), medicaments personnels (avec ordonnance traduite en anglais si possible), sels de rehydratation. Si vous prenez un traitement regulier, emportez suffisamment pour tout le sejour + quelques jours supplementaires."),
        tip("Gardez vos medicaments dans le bagage cabine, jamais en soute (en cas de perte de bagage)."),
        separator(),

        question("L'eau est-elle potable partout ?"),
        answer("Non ! Voici les recommandations : Eau potable du robinet = Paris, New York. Eau en bouteille recommandee = Istanbul, Marrakech, Bangkok, Dakar, Johannesburg, Dubai (meme si l'eau de Dubai est techniquement potable). Dans tous les cas, preferez l'eau en bouteille scellee pour eviter tout risque. Evitez les glacons dans les pays ou l'eau n'est pas potable."),
        separator(),

        question("Comment se proteger des moustiques ?"),
        answer("Destinations a risque paludisme : Dakar (modere), Bangkok (faible en ville, plus eleve en zone rurale). Protections : spray anti-moustiques (DEET 30%+), vetements longs le soir, moustiquaire si necessaire, traitement antipaludique preventif (consultez votre medecin). Pour les safaris en Afrique du Sud (Kruger Park), l'antipaludisme est fortement recommande."),
        separator(),

        question("Quels sont les numeros d'urgence par destination ?"),
        answer("Paris : SAMU 15, Police 17, Pompiers 18, Europeen 112. Dubai : Police 999, Ambulance 998, Pompiers 997. Istanbul : Ambulance 112, Police 155, Pompiers 110. Marrakech : Police 19, SAMU 15. Dakar : Police 17, SAMU 1515, Pompiers 18. Johannesburg : Police 10111, Ambulance 10177. New York : 911 (tout). Bangkok : Police touriste 1155, Ambulance 1669."),
        tip("Enregistrez les numeros d'urgence de votre destination dans votre telephone AVANT le depart."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 8. ARGENT & BUDGET
        // ==========================================
        title("8. ARGENT & BUDGET"),

        question("Quelle est la monnaie utilisee dans chaque destination ?"),
        answer("Paris = Euro (1 EUR = 656 FCFA, taux fixe). Dubai = Dirham AED (1 AED = environ 178 FCFA). Istanbul = Livre turque TRY (1 TRY = environ 18 FCFA). Marrakech = Dirham marocain MAD (1 MAD = environ 65 FCFA). Dakar = Franc CFA (meme monnaie !). Johannesburg = Rand ZAR (1 ZAR = environ 36 FCFA). New York = Dollar USD (1 USD = environ 600 FCFA). Bangkok = Baht THB (1 THB = environ 18 FCFA)."),
        separator(),

        question("Ou changer mon argent ?"),
        answer("Options par ordre de recommandation : 1) Bureaux de change en ville (meilleur taux). 2) Distributeurs automatiques sur place (taux bancaire correct, frais de retrait 2-5%). 3) Aeroport de depart/arrivee (taux moins favorable, a eviter pour les gros montants). 4) Votre banque en Cote d'Ivoire (demande a faire quelques jours avant). Ne changez JAMAIS dans la rue (risque d'arnaque)."),
        tip("Pour Dakar, pas besoin de changer : c'est le meme Franc CFA ! Pour Paris, le taux est fixe (656 FCFA = 1 EUR)."),
        separator(),

        question("Quel budget prevoir pour les repas ?"),
        answer("Budget repas quotidien moyen par destination : Paris = 40-60 EUR (26 000-39 000 FCFA). Dubai = 100-200 AED (18 000-36 000 FCFA). Istanbul = 200-500 TRY (3 600-9 000 FCFA). Marrakech = 150-300 MAD (10 000-20 000 FCFA). Dakar = 5 000-15 000 FCFA. Johannesburg = 200-500 ZAR (7 200-18 000 FCFA). New York = 40-70 USD (24 000-42 000 FCFA). Bangkok = 300-800 THB (5 400-14 400 FCFA). Ces budgets incluent dejeuner + diner. Le petit-dejeuner est inclus dans votre forfait SMG."),
        separator(),

        question("Faut-il donner des pourboires ?"),
        answer("Pourboires par destination : Paris = non obligatoire, 2-5 EUR apprecie. Dubai = 10-15% au restaurant. Istanbul = 10% au restaurant. Marrakech = 10-20 MAD aux guides/serveurs. Dakar = non obligatoire. Johannesburg = 10-15% ATTENDU (important !). New York = 15-20% OBLIGATOIRE (ne pas laisser de pourboire est tres mal vu). Bangkok = non obligatoire, 20-50 THB apprecie."),
        tip("Aux USA, le pourboire n'est pas optionnel. Les serveurs dependent des pourboires pour vivre. Prevoyez 15-20% systematiquement."),
        separator(),

        question("Ma carte bancaire fonctionnera-t-elle ?"),
        answer("Les cartes Visa et Mastercard sont acceptees dans la plupart des destinations. Avant de partir : prevenez votre banque de votre voyage (sinon elle peut bloquer la carte). Verifiez les frais de paiement a l'etranger (generalement 1-3%). Les cartes locales (GIM-UEMOA) ne fonctionnent generalement pas hors d'Afrique de l'Ouest. Pour Dakar, votre carte GIM-UEMOA fonctionnera."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 9. COMMUNICATION & INTERNET
        // ==========================================
        title("9. COMMUNICATION & INTERNET"),

        question("Comment avoir Internet a l'etranger ?"),
        answer("3 options : 1) Carte SIM locale (recommande) = achetez une carte SIM prepayee a l'aeroport d'arrivee. Cout : 5 000-15 000 FCFA avec data inclus. C'est la solution la moins chere. 2) eSIM (si votre telephone est compatible) = achetez en ligne avant de partir. 3) Roaming international = activez le roaming chez Orange/MTN/Moov CI. ATTENTION : tres cher ! A eviter sauf urgence."),
        tip("Achetez votre carte SIM locale des l'arrivee a l'aeroport. Vous aurez besoin d'Internet pour Uber, Google Maps et WhatsApp."),
        separator(),

        question("Quelles applications telecharger avant de partir ?"),
        answer("Indispensables : Google Maps (hors ligne - telechargez la carte de votre destination avant de partir !), Google Translate (telechargez la langue hors ligne), WhatsApp (communication avec SMG et vos proches), Uber/Grab/Careem (transport local), l'appli de votre compagnie aerienne, XE Currency (convertisseur de devises). Recommandees : TripAdvisor (restaurants/activites), Booking.com, l'appli de votre banque."),
        separator(),

        question("Le Wi-Fi est-il disponible partout ?"),
        answer("Wi-Fi gratuit disponible dans : la plupart des hotels (inclus dans les forfaits SMG), les aeroports, les centres commerciaux, beaucoup de restaurants et cafes. Qualite variable selon la destination : excellente a Dubai, Paris, New York, Bangkok. Correcte a Istanbul, Marrakech, Johannesburg. Limitee a Dakar (dependez plutot de la data mobile). Ne faites jamais de transactions bancaires sur un Wi-Fi public non securise."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 10. PRATIQUE & CULTURE
        // ==========================================
        title("10. INFORMATIONS PRATIQUES & CULTURE"),

        question("Quels sont les decalages horaires ?"),
        answer("Par rapport a Abidjan (GMT+0) : Paris = +0 a +1h (heure d'ete). Dubai = +4h. Istanbul = +3h. Marrakech = 0 a +1h. Dakar = meme heure. Johannesburg = +2h. New York = -5h. Bangkok = +7h. Le decalage horaire peut causer de la fatigue (jet lag). Plus le decalage est grand, plus le corps met de temps a s'adapter (1 jour par heure de decalage en general)."),
        separator(),

        question("Ai-je besoin d'un adaptateur electrique ?"),
        answer("Pas d'adaptateur necessaire : Marrakech, Istanbul, Dakar (prises europeennes type C). Adaptateur necessaire : Dubai (prises britanniques type G), Johannesburg (prises type M, 3 grosses broches), New York (prises americaines type A/B), Bangkok (variable, verifiez votre hotel). Achetez un adaptateur universel avant de partir (environ 5 000-10 000 FCFA)."),
        tip("Achetez un adaptateur universel multi-prises. Il vous servira pour toutes vos destinations futures."),
        separator(),

        question("Comment s'habiller dans les pays musulmans ?"),
        answer("Dubai, Istanbul, Marrakech : dans les zones publiques, portez des vetements couvrant les epaules et les genoux. Dans les mosquees : vetements longs, femmes doivent couvrir les cheveux (foulards souvent fournis a l'entree). A la plage/piscine/hotel : maillot de bain normal accepte. En pratique, ces villes sont tres touristiques et tolerantes, mais le respect du code vestimentaire local est apprecie."),
        separator(),

        question("Quels sont les jours feries a connaitre ?"),
        answer("Periodes a eviter ou a connaitre : Ramadan (1 mois, dates variables) = Dubai/Istanbul/Marrakech : restaurants fermes en journee, ambiance differente mais experiences uniques le soir (iftar). Nouvel An chinois (janvier/fevrier) = Bangkok tres anime. Thanksgiving (novembre) et 4 juillet = New York animation speciale. Noel et Nouvel An = partout, hotels plus chers, ambiance festive. Verifiez les jours feries de votre destination pour eviter les fermetures."),
        separator(),

        question("Quelle est la meilleure periode pour chaque destination ?"),
        answer("Paris = avril-juin, sept-oct. Dubai = nov-mars. Istanbul = avril-juin, sept-nov. Marrakech = mars-mai, sept-nov. Dakar = nov-mai. Johannesburg = mai-sept. New York = avril-juin, sept-nov. Bangkok = nov-fev. Evitez : Paris en aout (beaucoup de fermetures), Dubai en ete (45C+), Bangkok en avril (40C+)."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 11. TRANSPORT SUR PLACE
        // ==========================================
        title("11. TRANSPORT SUR PLACE"),

        question("Comment se deplacer dans chaque ville ?"),
        answer("Paris = metro (2 EUR/trajet, pass Navigo 30 EUR/semaine), bus, Uber. Dubai = metro moderne, taxis, Uber/Careem. Istanbul = Istanbulkart (carte rechargeable), metro, tramway, ferry, Uber. Marrakech = taxis rouges (negociez !), caleches. Dakar = taxis jaune-noir (negociez avant), TER, Dakar Dem Dikk. Johannesburg = Uber (recommande), Gautrain. New York = metro 24h/24 (2,90 USD), taxi jaune, Uber. Bangkok = BTS Skytrain, MRT metro, Grab, tuk-tuk."),
        separator(),

        question("Peut-on louer une voiture ?"),
        answer("La location de voiture est possible dans toutes les destinations. Vous aurez besoin de : votre permis de conduire ivoirien, un permis de conduire international (PCI, obtenu a la Prefecture de Police d'Abidjan, environ 10 000 FCFA), une carte bancaire internationale (pour la caution). Age minimum : generalement 21-25 ans. Recommandee : Dubai (ville etalee), Johannesburg (transports publics limites), Marrakech (excursions). Non recommandee : Paris et New York (parking cher, transports publics excellents), Bangkok (trafic terrible)."),
        separator(),

        question("Uber fonctionne-t-il partout ?"),
        answer("Uber est disponible a : Paris, Dubai, Istanbul, Johannesburg, New York, Dakar. Alternatives : Careem (Dubai, Istanbul), Grab (Bangkok), Lyft (New York), Yango (Dakar). A Marrakech, privilegiez les taxis (pas d'Uber). Les VTC sont generalement plus surs et plus confortables que les taxis locaux, surtout quand vous ne connaissez pas la ville."),
        separator(),

        question("Ai-je besoin d'un permis international ?"),
        answer("Le Permis de Conduire International (PCI) est recommande pour : Dubai, Johannesburg, New York, Bangkok. Il n'est pas necessaire pour : Paris (permis ivoirien accepte pour les courts sejours), Marrakech, Dakar, Istanbul. Comment l'obtenir : Prefecture de Police d'Abidjan, cout environ 10 000 FCFA, delai 1-2 semaines, apportez votre permis ivoirien + 2 photos + piece d'identite."),
        separator(),

        new Paragraph({ children: [new PageBreak()] }),

        // ==========================================
        // 12. PROGRAMMES SPECIAUX
        // ==========================================
        title("12. PROGRAMMES SPECIAUX SMG"),

        question("SMG propose-t-il des voyages de noces ?"),
        answer("Oui ! SMG propose des forfaits lune de miel sur mesure. Destinations populaires : Dubai (luxe et romantisme), Marrakech (charme et depaysement), Bangkok + iles (plages paradisiaques), Paris (ville de l'amour). Les forfaits lune de miel incluent : hotel 4-5 etoiles, chambre avec vue, decoration romantique a l'arrivee, diner aux chandelles, excursion privee. Supplement : a partir de 150 000 FCFA par rapport au forfait standard."),
        tip("Reservez votre voyage de noces au moins 2 mois a l'avance pour les meilleures offres."),
        separator(),

        question("Comment organiser un voyage de groupe ou incentive ?"),
        answer("SMG organise des voyages de groupe pour : entreprises (team building, incentive, seminaires), associations, familles elargies, ecoles. A partir de 5 personnes = tarif groupe. 10+ personnes = jusqu'a 15% de reduction. 15+ personnes = accompagnateur SMG gratuit. Nous gerons : vols groupes, hebergement, activites, restauration, logistique complete. Contactez un conseiller pour un devis sur mesure."),
        separator(),

        question("SMG organise-t-il des pelerinages ?"),
        answer("Oui, SMG organise des pelerinages : Hajj (La Mecque) = forfait complet incluant vol, hebergement, transport local, accompagnement spirituel. Reservez 6 mois a l'avance minimum. Omra (hors saison Hajj) = forfait a partir de 1 500 000 FCFA, incluant vol, hotel proche de la mosquee, visa, transferts. Pelerinages chretiens (Jerusalem, Lourdes, Rome) = sur demande, forfait sur mesure. Tous les pelerinages incluent un accompagnateur guide spirituel."),
        separator(),

        question("SMG organise-t-il des voyages scolaires ?"),
        answer("Oui, SMG propose des voyages scolaires et pedagogiques. Destinations populaires : Dakar (histoire, ile de Goree), Marrakech (culture), Paris (musees, histoire). Les forfaits scolaires incluent : tarifs reduits pour les eleves, accompagnateurs (1 gratuit pour 10 eleves), programme pedagogique adapte, assurance groupe. Conditions : minimum 15 eleves, reservation 3 mois a l'avance, accord ecrit des parents."),
        separator(),

        question("Proposez-vous des voyages d'affaires ?"),
        answer("Oui, SMG dispose d'un service dedie aux voyages d'affaires : billets d'avion (economique ou Business), hotels proches des centres d'affaires, transferts VIP aeroport, salles de conference (en option), visa express (acceleration des demarches), factures entreprise. Les entreprises peuvent ouvrir un compte SMG pour simplifier la facturation et beneficier de tarifs negocies."),
        separator(),

        question("Existe-t-il un programme de fidelite SMG ?"),
        answer("Oui, le programme SMG Fidelite recompense vos voyages : 1er voyage = inscription automatique. 3e voyage = reduction de 5% sur le prochain voyage. 5e voyage = surclassement hotel gratuit (3 vers 4 etoiles). 10e voyage = reduction de 15% + cadeau surprise. Parrainage = recommandez SMG a un ami qui reserve, vous recevez tous les deux 25 000 FCFA de reduction sur votre prochain voyage. Les points sont cumulables et valables 2 ans."),
        tip("Parrainez vos amis ! Chaque parrainage vous rapporte 25 000 FCFA de reduction."),
        separator(),

        // FINAL NOTE
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 3, color: BLUE, space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 3, color: BLUE, space: 8 } },
          children: [new TextRun({ text: "Document de reference pour le Bot WhatsApp SMG", bold: true, font: "Arial", size: 22, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Mettez a jour ces informations regulierement pour que le bot reste pertinent et exact.", font: "Arial", size: 20, color: GRAY, italics: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "SMG Voyages - Abidjan, Cote d'Ivoire - Avril 2026", font: "Arial", size: 18, color: GRAY })],
        }),
      ],
    },
  ],
});

const outputPath = process.argv[2] || "FAQ_SMG_Voyages.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("OK: " + outputPath);
});
