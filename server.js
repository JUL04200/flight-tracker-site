require('dotenv').config();
const express = require('express');
const path = require('path');
const { generateCode } = require('./codes');
const { createOrder, captureOrder, PAYPAL_CLIENT_ID } = require('./paypal');
const { sendCodeEmail } = require('./mailer');
const { PLANS, DURATIONS, PRICES, FEATURES, FAQ, BOT_USERNAME, TRIAL_DAYS, PORT } = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.render('checkout', { plan, planKey: req.params.plan, durations: DURATIONS, priceFor, botUsername: BOT_USERNAME, paypalClientId: PAYPAL_CLIENT_ID });
});

// --- API PayPal : le montant est toujours recalculé côté serveur, jamais fait confiance au client ---

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { plan: planKey, duration: durationKey, email } = req.body;
    const plan = PLANS[planKey];
    const duration = DURATIONS[durationKey];
    if (!plan || !duration) return res.status(400).json({ error: 'Plan ou durée invalide.' });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });

    const price = priceFor(planKey, durationKey);
    const customId = `${planKey}|${durationKey}|${email}`;
    const order = await createOrder(price, 'EUR', customId);
    if (!order.id) return res.status(500).json({ error: 'Erreur PayPal lors de la création de la commande.' });
    res.json({ id: order.id });
  } catch (e) {
    console.error('[PAYPAL] create-order:', e.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: 'orderID manquant.' });

    const capture = await captureOrder(orderID);
    if (capture.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Paiement non confirmé par PayPal.' });
    }

    const customId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
      || capture.purchase_units?.[0]?.custom_id;
    const [planKey, durationKey, email] = (customId || '').split('|');
    const plan = PLANS[planKey];
    const duration = DURATIONS[durationKey];
    if (!plan || !duration || !email) {
      return res.status(500).json({ error: 'Commande introuvable après paiement — contactez le support.' });
    }

    const entry = await generateCode(planKey, duration.months, email);
    await sendCodeEmail(email, entry.code, plan.label, duration.label);

    res.json({ code: entry.code, plan: plan.label, duration: duration.label, email });
  } catch (e) {
    console.error('[PAYPAL] capture-order:', e.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.get('/mentions-legales', (req, res) => res.render('legal', { title: 'Mentions légales', botUsername: BOT_USERNAME }));
app.get('/confidentialite', (req, res) => res.render('legal', { title: 'Politique de confidentialité', botUsername: BOT_USERNAME }));
app.get('/cgv', (req, res) => res.render('legal', { title: 'Conditions générales de vente', botUsername: BOT_USERNAME }));
app.get('/contact', (req, res) => res.render('legal', { title: 'Contact', botUsername: BOT_USERNAME }));

app.listen(PORT, () => console.log(`Flight Tracker Site running on http://localhost:${PORT}`));
