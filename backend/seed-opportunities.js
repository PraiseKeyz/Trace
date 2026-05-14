'use strict';

// Run from backend/ directory:  node seed-opportunities.js
// Requires DATABASE_URL in backend/.env

require('dotenv').config({ path: './.env' });

const path   = require('path');
const argon2 = require('argon2');
const { Pool } = require('pg');

// ── Seed config ───────────────────────────────────────────────────────────────

const SEED_PASSWORD = 'Trace@2024';

const SEED_USERS = [
  { phone: '+2348100000001', full_name: 'Adebayo Segun', persona: 'trader',     state: 'Lagos',   city: 'Yaba',          email: 'adebayo@trace-seed.com' },
  { phone: '+2348100000002', full_name: 'Chinwe Obi',    persona: 'gig_worker', state: 'Abuja',   city: 'Wuse',          email: 'chinwe@trace-seed.com'  },
  { phone: '+2348100000003', full_name: 'Ibrahim Musa',  persona: 'trader',     state: 'Kano',    city: 'Kano City',     email: 'ibrahim@trace-seed.com' },
  { phone: '+2348100000004', full_name: 'Aisha Bello',   persona: 'gig_worker', state: 'Rivers',  city: 'Port Harcourt', email: 'aisha@trace-seed.com'   },
  { phone: '+2348100000005', full_name: 'Emeka Eze',     persona: 'trader',     state: 'Anambra', city: 'Onitsha',       email: 'emeka@trace-seed.com'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function nullOrVal(v) {
  return v === undefined || v === null ? null : v;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not found — make sure backend/.env exists and contains DATABASE_URL');
  }

  const pool = new Pool({ connectionString: url });

  try {
    // Quick connectivity check
    await pool.query('SELECT 1');
    console.log('✓ Connected to database\n');

    // ── Step 1: Seed users ─────────────────────────────────────────────────

    console.log('── Seeding poster users ────────────────────────────────────');
    const passwordHash = await argon2.hash(SEED_PASSWORD);

    const seededUsers = [];

    for (const u of SEED_USERS) {
      // Upsert: insert if phone not taken, else return the existing row
      const { rows } = await pool.query(
        `INSERT INTO users
           (id, phone, full_name, email, persona, state, city,
            password_hash, is_phone_verified, onboarding_complete, role,
            created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, $6,
            $7, true, true, ARRAY['user']::\"Role\"[],
            NOW(), NOW())
         ON CONFLICT (phone) DO UPDATE
           SET updated_at = EXCLUDED.updated_at   -- no-op touch so RETURNING works
         RETURNING id, phone, full_name, persona`,
        [u.phone, u.full_name, u.email, u.persona, u.state, u.city, passwordHash]
      );

      const user = rows[0];
      seededUsers.push(user);

      // Ensure economic profile exists
      await pool.query(
        `INSERT INTO economic_profiles (id, user_id)
         VALUES (gen_random_uuid(), $1)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      console.log(`  ✓ ${user.full_name.padEnd(20)} ${user.phone}   id: ${user.id}`);
    }

    // ── Step 2: Clear old seeded opportunities ─────────────────────────────

    console.log('\n── Seeding opportunities ───────────────────────────────────');

    const seededIds = seededUsers.map(u => u.id);
    const placeholders = seededIds.map((_, i) => `$${i + 1}`).join(', ');

    // Delete applications first (FK constraint), then opportunities
    const { rowCount: delApps } = await pool.query(
      `DELETE FROM opportunity_applications
       WHERE opportunity_id IN (
         SELECT id FROM opportunities WHERE posted_by IN (${placeholders})
       )`,
      seededIds
    );

    const { rowCount: delOpps } = await pool.query(
      `DELETE FROM opportunities WHERE posted_by IN (${placeholders})`,
      seededIds
    );

    if (delOpps > 0) {
      console.log(`  Cleared ${delOpps} previously seeded opportunities (+ ${delApps} applications)`);
    }

    // ── Step 3: Insert opportunities ───────────────────────────────────────

    const opportunitiesPath = path.resolve(__dirname, '../docs/opportunities_seed.json');
    const opportunities = require(opportunitiesPath);
    console.log(`  Loaded ${opportunities.length} opportunities from JSON\n`);

    let count = 0;
    for (const [index, opp] of opportunities.entries()) {
      const poster = seededUsers[index % seededUsers.length];

      await pool.query(
        `INSERT INTO opportunities
           (id, posted_by, title, description, type,
            skills_required, languages_required,
            state, city, latitude, longitude,
            is_remote, pay_min, pay_max, currency,
            status, payment_method, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4,
            $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, NOW(), NOW())`,
        [
          poster.id,
          opp.title,
          nullOrVal(opp.description),
          opp.type,
          opp.skills_required   ?? [],
          opp.languages_required ?? [],
          nullOrVal(opp.state),
          nullOrVal(opp.city),
          nullOrVal(opp.latitude),
          nullOrVal(opp.longitude),
          opp.is_remote ?? false,
          nullOrVal(opp.pay_min),
          nullOrVal(opp.pay_max),
          opp.currency        ?? 'NGN',
          opp.status          ?? 'open',
          opp.payment_method  ?? 'squad',
        ]
      );

      count++;
      if (count % 25 === 0 || count === opportunities.length) {
        process.stdout.write(`  Inserted ${count}/${opportunities.length}...\r`);
      }
    }

    // ── Done ───────────────────────────────────────────────────────────────

    console.log(`\n  ✓ ${count} opportunities seeded                          `);
    console.log('\n✅  Seeding complete!\n');
    console.log('─'.repeat(60));
    console.log('Seed user credentials (password same for all):');
    console.log(`  Password: ${SEED_PASSWORD}\n`);
    for (const u of SEED_USERS) {
      console.log(`  ${u.phone}  →  ${u.full_name} (${u.persona})`);
    }
    console.log('─'.repeat(60));

  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('\n❌ Seeding failed:', err.message);
  if (err.code)   console.error('   Code:',   err.code);
  if (err.detail) console.error('   Detail:', err.detail);
  process.exit(1);
});
