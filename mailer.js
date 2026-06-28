// Stub d'envoi d'e-mail — à remplacer par un vrai service (Resend, SendGrid, SMTP...).
// En attendant, on logue simplement ce qui aurait été envoyé.
const { BOT_USERNAME } = require('./config');

async function sendCodeEmail(email, code, planLabel, durationLabel) {
  console.log(`[MAIL] À: ${email} — Code ${code} (${planLabel}, ${durationLabel}) — lien bot: https://t.me/${BOT_USERNAME}`);
  return true;
}

module.exports = { sendCodeEmail };
