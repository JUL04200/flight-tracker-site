const { supabase } = require('./db');

async function createPendingOrder({ email, plan, durationKey, durationMonths, price }) {
  const { data, error } = await supabase
    .from('pending_orders')
    .insert({ email, plan, duration_key: durationKey, duration_months: durationMonths, price, status: 'pending' })
    .select()
    .single();
  if (error) throw new Error('Supabase insert failed: ' + error.message);
  return data;
}

// Associe un paiement reçu à la commande en attente la plus ancienne du même montant
async function findOldestPendingByPrice(price) {
  const { data, error } = await supabase
    .from('pending_orders')
    .select('*')
    .eq('status', 'pending')
    .eq('price', price)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error('Supabase select failed: ' + error.message);
  return data;
}

async function markFulfilled(id) {
  const { error } = await supabase.from('pending_orders').update({ status: 'fulfilled' }).eq('id', id);
  if (error) throw new Error('Supabase update failed: ' + error.message);
}

module.exports = { createPendingOrder, findOldestPendingByPrice, markFulfilled };
