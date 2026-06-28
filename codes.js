const { supabase } = require('./db');

// Même charset que le bot Telegram (FT-XXXX-XXXX), sans 0/O/1/I pour éviter les confusions
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return s;
}

async function generateCode(plan, durationMonths, userEmail) {
  let code;
  let exists = true;
  while (exists) {
    code = `FT-${randomSegment(4)}-${randomSegment(4)}`;
    const { data } = await supabase.from('codes').select('code').eq('code', code).maybeSingle();
    exists = !!data;
  }

  const entry = {
    code, plan, duration_months: durationMonths,
    bought_by: userEmail || null,
    status: 'unused', used_by: null, used_at: null
  };
  const { error } = await supabase.from('codes').insert(entry);
  if (error) throw new Error('Supabase insert failed: ' + error.message);
  return entry;
}

module.exports = { generateCode };
