require('dotenv').config();
const express = require('express');
const path = require('path');
const { generateCode } = require('./codes');
const { sendCodeEmail } = require('./mailer');
const { createPendingOrder, findOldestPendingByPrice, markFulfilled } = require('./pending-orders');
const { verifyIpn } = require('./paypal-ipn');
const { PLANS, DURATIONS, PRICES, FEATURES, FAQ, BOT_USERNAME, PAYPAL_ME_USERNAME, TRIAL_DAYS, PORT } = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true, verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); } }));
app.use(express.static(path.join(__dirname, 'public')));

function priceFor(planKey, durationKey) {
  return PRICES[planKey] ? PRICES[planKey][durationKey] ?? null : null;
}

app.get('/', (req, res) => {
  res.render('home', { plans: PLANS, durations: DURATIONS, features: FEATURES, faq: FAQ, botUsername: BOT_USERNAME, trialDays: TRIAL_DAYS, priceFor });
});

app.get('/checkout/:plan', (req, res) => {
  const plan = PLANS[req.params.plan];
  if (!plan) return res.redirect('/');
  res.render('checkout', { plan, planKey: req.params.plan, durations: DURATIONS, priceFor, botUsername: BOT_USERNAME, error: null });
});

app.post('/checkout/:plan/pay', async (req, res) => {
  const planKey = req.params.plan;
  const plan = PLANS[planKey];
  const { duration: durationKey, email } = req.body;
  const duration = DURATIONS[durationKey];
  if (!plan || !duration) return res.redirect('/');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.render('checkout', { plan, planKey, durations: DURATIONS, priceFor, botUsername: BOT_USERNAME, error: 'Adresse e-mail invalide.' });
  }

  const price = priceFor(planKey, durationKey);
  await createPendingOrder({ email, plan: planKey, durationKey, durationMonths: duration.months, price });

  const paypalMeLink = `https://paypal.me/${PAYPAL_ME_USERNAME}/${price}EUR`;
  res.render('pending', { plan, duration, email, botUsername: BOT_USERNAME, paypalMeLink, price });
});

// --- IPN PayPal : notification automatique envoyée par PayPal à chaque paiement reçu ---
// Marche avec un compte PayPal personnel (pas besoin de compte Business / API)
app.post('/api/paypal/ipn', async (req, res) => {
  res.sendStatus(200); // accuser réception immédiatement, comme l'exige PayPal

  try {
    const verified = await verifyIpn(req.rawBody);
    if (!verified) return console.warn('[IPN] Notification non vérifiée, ignorée.');

    const { payment_status, mc_gross, mc_currency } = req.body;
    if (payment_status !== 'Completed' || mc_currency !== 'EUR') return;

    const price = parseFloat(mc_gross);
    const order = await findOldestPendingByPrice(price);
    if (!order) return console.warn(`[IPN] Aucune commande en attente pour ${price} €.`);

    const plan = PLANS[order.plan];
    const entry = await generateCode(order.plan, order.duration_months, order.email);
    await sendCodeEmail(order.email, entry.code, plan.label, DURATIONS[order.duration_key].label);
    await markFulfilled(order.id);
    console.log(`[IPN] Code ${entry.code} envoyé à ${order.email} pour la commande ${order.id}.`);
  } catch (e) {
    console.error('[IPN] Erreur traitement:', e.message);
  }
});

app.get('/mentions-legales', (req, res) => res.render('legal', { title: 'Mentions légales', botUsername: BOT_USERNAME }));
app.get('/confidentialite', (req, res) => res.render('legal', { title: 'Politique de confidentialité', botUsername: BOT_USERNAME }));
app.get('/cgv', (req, res) => res.render('legal', { title: 'Conditions générales de vente', botUsername: BOT_USERNAME }));
app.get('/contact', (req, res) => res.render('legal', { title: 'Contact', botUsername: BOT_USERNAME }));

app.listen(PORT, () => console.log(`Flight Tracker Site running on http://localhost:${PORT}`));
