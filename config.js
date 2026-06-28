require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4040,
  BOT_USERNAME: process.env.BOT_USERNAME || 'Flightq_bot',
  PAYPAL_ME_USERNAME: process.env.PAYPAL_ME_USERNAME || 'florencearrouasse',
  TRIAL_DAYS: 3,
  PLANS: {
    standard: {
      key: 'standard', label: 'Standard', monthlyPrice: 4.99,
      features: ['Jusqu\'à 3 surveillances actives', 'Vérification toutes les 30 minutes', 'Notifications Telegram'],
      highlight: false
    },
    premium: {
      key: 'premium', label: 'Premium', monthlyPrice: 9.99,
      features: ['Surveillances illimitées', 'Vérification toutes les 5 à 10 minutes', 'Notifications prioritaires', 'Historique complet'],
      highlight: true
    },
  },
  DURATIONS: {
    '1m': { months: 1, label: '1 mois' },
    '3m': { months: 3, label: '3 mois' },
    '6m': { months: 6, label: '6 mois' },
    '1y': { months: 12, label: '1 an' },
  },
  // Prix totaux ronds par plan/durée, avec une remise croissante sur les engagements longs
  PRICES: {
    standard: { '1m': 4.99, '3m': 13.99, '6m': 24.99, '1y': 44.99 },
    premium: { '1m': 9.99, '3m': 26.99, '6m': 49.99, '1y': 89.99 },
  },
  FEATURES: [
    { icon: '📉', title: 'Surveillance des baisses de prix', text: 'Suivez un trajet précis et soyez alerté dès que le prix descend sous votre seuil.' },
    { icon: '💺', title: 'Surveillance des disponibilités', text: 'Soyez prévenu dès qu\'une place se libère sur un vol complet.' },
    { icon: '🔔', title: 'Alertes Telegram instantanées', text: 'Recevez vos alertes directement dans Telegram, sans rien installer.' },
    { icon: '⚡', title: 'Vérifications automatiques', text: 'Le bot vérifie vos trajets en continu, jour et nuit.' },
    { icon: '⭐', title: 'Standard et Premium', text: 'Choisissez le plan qui correspond à votre usage.' },
    { icon: '🎁', title: 'Essai Premium gratuit', text: '3 jours pour tester toutes les fonctionnalités Premium.' },
  ],
  FAQ: [
    { q: 'Comment fonctionne Flight Tracker ?', a: 'Vous indiquez au bot Telegram le vol ou le trajet à surveiller. Il vérifie automatiquement les prix ou la disponibilité et vous alerte dès qu\'un changement intéressant est détecté.' },
    { q: 'Comment activer mon abonnement ?', a: 'Après votre achat, vous recevez un code d\'activation. Ouvrez le bot Telegram, cliquez sur « J\'ai un abonnement » et entrez ce code.' },
    { q: 'Comment utiliser mon code ?', a: 'Dans le bot, choisissez « 💳 J\'ai un abonnement » puis collez le code reçu par e-mail. Votre abonnement est activé immédiatement.' },
    { q: 'Y a-t-il un essai gratuit ?', a: 'Oui, un essai Premium gratuit de 3 jours est proposé directement dans le bot, sans carte bancaire.' },
    { q: 'Quelle est la différence entre Standard et Premium ?', a: 'Standard limite à 3 surveillances actives avec une vérification toutes les 30 minutes. Premium offre des surveillances illimitées, des vérifications toutes les 5 à 10 minutes, des notifications prioritaires et l\'historique complet.' },
  ],
};
