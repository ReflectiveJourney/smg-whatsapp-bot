// ============================================
// CLAUDE.JS — Intelligence Artificielle (Google Gemini)
// Option A — Twilio
// ============================================
// Ce fichier utilise l'API Google Gemini (gratuite) pour comprendre
// les messages complexes que le bot ne sait pas traiter tout seul.
// Gemini ne doit JAMAIS inventer des prix ou disponibilités —
// il se base uniquement sur les données de voyages.json.
//
// NOTE : Quand tu auras des crédits Anthropic, tu pourras
// revenir à Claude en remplaçant ce fichier par l'original.

const axios = require('axios');
const voyages = require('./voyages.json');

// Clé API Gemini depuis le fichier .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Le "system prompt" définit le comportement de l'IA
const SYSTEM_PROMPT = `Tu es l'assistant virtuel de *SMG*, une agence de voyage basée en Côte d'Ivoire.

Ton rôle :
- Répondre aux questions des clients sur les voyages, destinations, prix et réservations
- Être chaleureux, professionnel et francophone
- Utiliser le formatage WhatsApp : *gras*, _italique_, listes avec tirets
- Toujours afficher les prix en FCFA d'abord, puis en euros entre parenthèses

CONTEXTE DE CONVERSATION :
- Tu reçois l'historique des derniers messages de la conversation
- Si le client fait référence à une destination précédemment mentionnée (ex: "et les disponibilités ?", "c'est combien ?"), utilise le contexte de la conversation pour comprendre de quelle destination il parle
- Ne demande JAMAIS au client de répéter une information qu'il a déjà donnée dans la conversation

QUESTIONS HORS CATALOGUE — TU DOIS RÉPONDRE :
Tu peux et tu dois répondre aux questions générales liées au voyage, même si elles ne sont pas dans les données SMG ci-dessous :
- Informations générales sur une destination (météo, culture, monnaie, décalage horaire, langue parlée...)
- Conseils pratiques (quoi emporter, sécurité, santé, vaccins recommandés...)
- Comparaisons entre destinations ("Paris ou Dubai, lequel est mieux pour...")
- Estimations de budget global (repas, transports sur place, pourboires...)
- Questions sur les compagnies aériennes au départ d'Abidjan
- Toute question liée au voyage formulée différemment

Pour ces questions générales, utilise tes connaissances, mais PRÉCISE que pour les prix et disponibilités exacts, il faut se référer aux offres SMG.

RÈGLES STRICTES SUR LES PRIX SMG :
- Tu ne dois JAMAIS inventer de prix SMG, disponibilité SMG ou offre SMG
- Pour les prix et disponibilités SMG, utilise UNIQUEMENT les données ci-dessous
- Ne réponds JAMAIS en HTML, uniquement en texte simple avec formatage WhatsApp
- Sois concis : les messages WhatsApp doivent être courts et lisibles
- Ne génère JAMAIS de message d'erreur technique

QUESTIONS INTERDITES — NE JAMAIS RÉPONDRE :
- Marges, commissions ou bénéfices de l'agence
- Coordonnées privées des partenaires ou fournisseurs
- Contrats fournisseurs
- Données personnelles d'autres clients
- Mots de passe ou accès système
Pour ces sujets, réponds : "Cette information est réservée à notre équipe interne. Puis-je vous aider avec autre chose ? 😊"

Voici les données actuelles de SMG :
${JSON.stringify(voyages, null, 2)}

Si la question n'est absolument pas liée au voyage, réponds :
"Je n'ai pas cette information pour le moment. Je vous mets en relation avec un conseiller SMG qui pourra vous aider."`;

// Fonction principale : envoie le message du client à Gemini et récupère la réponse
async function analyserMessage(message, historiqueConversation) {
  try {
    // Préparer l'historique pour Gemini (les 10 derniers échanges)
    // Gemini utilise "user" et "model" comme rôles (pas "assistant")
    const contents = [];

    if (historiqueConversation && historiqueConversation.length > 0) {
      for (const msg of historiqueConversation.slice(-10)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Ajouter le nouveau message s'il n'est pas déjà dans l'historique
    if (
      contents.length === 0 ||
      contents[contents.length - 1].parts[0].text !== message
    ) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    // S'assurer que la conversation commence par un message "user"
    // (exigence de l'API Gemini)
    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    // S'assurer qu'il n'y a pas deux messages consécutifs du même rôle
    const contentsFiltres = [];
    for (let i = 0; i < contents.length; i++) {
      if (i === 0 || contents[i].role !== contents[i - 1].role) {
        contentsFiltres.push(contents[i]);
      } else {
        // Fusionner avec le message précédent du même rôle
        const dernier = contentsFiltres[contentsFiltres.length - 1];
        dernier.parts[0].text += '\n' + contents[i].parts[0].text;
      }
    }

    // Vérifier qu'on a au moins un message
    if (contentsFiltres.length === 0) {
      contentsFiltres.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    // Appel à l'API Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const reponse = await axios.post(url, {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: contentsFiltres,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Extraire le texte de la réponse de Gemini
    const texteReponse =
      reponse.data.candidates[0].content.parts[0].text;

    // Vérifier que Gemini n'a pas dit qu'il ne sait pas
    if (
      texteReponse.includes("je n'ai pas cette information") ||
      texteReponse.includes('je ne dispose pas') ||
      texteReponse.includes('je vous mets en relation')
    ) {
      return null;
    }

    return texteReponse;
  } catch (erreur) {
    console.error('Erreur API Gemini :', erreur.response?.data || erreur.message);
    throw erreur;
  }
}

module.exports = { analyserMessage };
