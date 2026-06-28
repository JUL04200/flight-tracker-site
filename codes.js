const { db, save } = require('./db');

// Même charset que le bot Telegram (FT-XXXX-XXXX), sans 0/O/1/I pour éviter les confusions
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return s;
}

function generateCode(plan, durationMonths, userEmail) {
  let code;
  do {
    code = `FT-${randomSegment(4)}-${randomSegment(4)}`;
  } while (db.codes[code]);

  const entry = {
    code, plan, durationMonths,
    createdAt: new Date().toISOString(),
    boughtBy: userEmail || null,
    status: 'unused', usedBy: null, usedAt: null
  };
  db.codes[code] = entry;
  save();
  return entry;
}

module.exports = { generateCode };
