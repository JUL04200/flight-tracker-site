// Stub de paiement — à remplacer par une vraie intégration Stripe (Checkout Session + webhook).
// Le reste du site n'a pas besoin de changer : processPayment() doit juste renvoyer { success }.
async function processPayment(user, plan, duration, priceInfo) {
  return { success: true, transactionId: `sim_${Date.now()}` };
}

module.exports = { processPayment };
