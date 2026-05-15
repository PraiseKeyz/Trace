'use strict';

// Backfill script — resets onboarding_complete for users missing gender or dob.
// Run from backend/ directory:  node scripts/backfill-gender-dob.js
// Requires DATABASE_URL in backend/.env

require('dotenv').config({ path: './.env' });

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Find users who completed onboarding but are missing gender or dob
    const { rows: affected } = await client.query(`
      SELECT id, phone, full_name, gender, dob, onboarding_complete
      FROM users
      WHERE onboarding_complete = true
        AND (gender IS NULL OR dob IS NULL)
    `);

    if (affected.length === 0) {
      console.log('✅ No users need backfilling. All onboarded users have gender and dob set.');
      return;
    }

    console.log(`Found ${affected.length} user(s) missing gender or dob:\n`);
    affected.forEach((u) => {
      console.log(
        `  - ${u.full_name ?? u.phone} | gender: ${u.gender ?? 'NULL'} | dob: ${u.dob ?? 'NULL'}`,
      );
    });

    // Reset onboarding_complete so they re-onboard and provide the missing fields
    const ids = affected.map((u) => u.id);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');

    const { rowCount } = await client.query(
      `UPDATE users SET onboarding_complete = false WHERE id IN (${placeholders})`,
      ids,
    );

    console.log(`\n✅ Reset onboarding_complete = false for ${rowCount} user(s).`);
    console.log('   These users will be prompted to re-complete their profile.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err.message);
  process.exit(1);
});
