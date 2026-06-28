const express = require('express');
const path = require('path');
const { load } = require('./db');
const { generateCode } = require('./codes');
const { processPayment } = require('./payment');
const { sendCodeEmail } = require('./mailer');
const { PLANS, DURATIONS, PRICES, FEATURES, FAQ, BOT_USERNAME, TRIAL_DAYS, PORT } = require('./config');

load();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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
  const payment = await processPayment({ email }, planKey, durationKey, price);
  if (!payment.success) {
    return res.render('checkout', { plan, planKey, durations: DURATIONS, priceFor, botUsername: BOT_USERNAME, error: 'Paiement refusé, réessayez.' });
  }

  const entry = generateCode(planKey, duration.months, email);
  await sendCodeEmail(email, entry.code, plan.label, duration.label);

  res.render('success', { plan, duration, code: entry.code, email, botUsername: BOT_USERNAME });
});

app.get('/mentions-legales', (req, res) => res.render('legal', { title: 'Mentions légales', botUsername: BOT_USERNAME }));
app.get('/confidentialite', (req, res) => res.render('legal', { title: 'Politique de confidentialité', botUsername: BOT_USERNAME }));
app.get('/cgv', (req, res) => res.render('legal', { title: 'Conditions générales de vente', botUsername: BOT_USERNAME }));
app.get('/contact', (req, res) => res.render('legal', { title: 'Contact', botUsername: BOT_USERNAME }));

app.listen(PORT, () => console.log(`Flight Tracker Site running on http://localhost:${PORT}`));
