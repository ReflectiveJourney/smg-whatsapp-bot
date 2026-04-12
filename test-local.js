// ============================================
// TEST-LOCAL.JS — Tester le bot sans WhatsApp
// ============================================
// Ce fichier simule une conversation WhatsApp directement
// dans ton terminal. Aucun message Twilio n'est utilisé.
// Lance avec : node test-local.js

require('dotenv').config();
const readline = require('readline');
const bot = require('./bot');

// readline permet de lire ce que tu tapes dans le terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Numéro fictif pour simuler un client
const NUMERO_TEST = 'whatsapp:+225TEST';

console.log('');
console.log('========================================');
console.log('  TEST LOCAL — Bot WhatsApp SMG');
console.log('  Tape tes messages comme sur WhatsApp');
console.log('  Tape "quit" pour quitter');
console.log('========================================');
console.log('');

function poserQuestion() {
  rl.question('👤 Toi : ', async (message) => {
    if (message.toLowerCase() === 'quit') {
      console.log('\nAu revoir ! 👋');
      rl.close();
      return;
    }

    try {
      const reponse = await bot.traiterMessage(message, NUMERO_TEST);
      console.log(`\n🤖 Bot SMG :\n${reponse}\n`);
    } catch (erreur) {
      console.error('Erreur :', erreur.message);
    }

    poserQuestion();
  });
}

poserQuestion();
