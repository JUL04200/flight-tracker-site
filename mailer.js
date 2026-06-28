const { RESEND_API_KEY, MAIL_FROM, BOT_USERNAME } = require('./config');

async function sendCodeEmail(email, code, planLabel, durationLabel) {
  if (!RESEND_API_KEY) {
    console.log(`[MAIL] (non envoyé, RESEND_API_KEY manquante) À: ${email} — Code ${code}`);
    return false;
  }

  const html = `
    <p>Merci pour votre achat Flight Tracker !</p>
    <p>Plan : <strong>${planLabel}</strong> — ${durationLabel}</p>
    <p>Votre code d'activation :</p>
    <p style="font-size:22px; font-weight:bold; letter-spacing:1px;">${code}</p>
    <p>Pour l'activer : ouvrez le bot Telegram <a href="https://t.me/${BOT_USERNAME}">@${BOT_USERNAME}</a>, cliquez sur « J'ai un abonnement » puis entrez ce code.</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [email],
      subject: `Votre code d'activation Flight Tracker — ${code}`,
      html
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[MAIL] Erreur Resend:', res.status, text);
    return false;
  }
  return true;
}

module.exports = { sendCodeEmail };
