// Vérifie une notification IPN PayPal en la renvoyant à PayPal pour confirmation,
// comme l'exige le protocole IPN (cmd=_notify-validate).
const IPN_VERIFY_URL = process.env.PAYPAL_IPN_VERIFY_URL || 'https://ipnpb.paypal.com/cgi-bin/webscr';

async function verifyIpn(rawBody) {
  const res = await fetch(IPN_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `cmd=_notify-validate&${rawBody}`
  });
  const text = await res.text();
  return text.trim() === 'VERIFIED';
}

module.exports = { verifyIpn };
