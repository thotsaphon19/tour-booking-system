#!/usr/bin/env node
/**
 * Reset an admin's password directly in the database.
 *
 * Use this if an admin account is locked out and changing the password
 * through /admin/admins doesn't seem to work (or isn't reachable at all —
 * e.g. it was the *only* super admin account). This bypasses the web UI
 * entirely and writes straight to the database, using the exact same
 * bcrypt hashing the app itself uses to verify logins — so there's no risk
 * of a format mismatch between how this script hashes the password and how
 * the app checks it.
 *
 * Usage:
 *   node scripts/reset-admin-password.js <email> <new-password>
 *
 * Example:
 *   node scripts/reset-admin-password.js admin@example.com "MyNewPassword123!"
 *
 * Requires DATABASE_URL to be set — either already exported in your shell,
 * or present in a .env.local / .env file in the project root (same file
 * the app itself reads it from).
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// Next.js loads .env.local automatically at runtime, but a plain `node`
// script doesn't — so load it here the same simple way, without requiring
// the `dotenv` package as an extra dependency.
function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const [, , email, newPassword] = process.argv;

  if (!email || !newPassword) {
    console.error("Usage: node scripts/reset-admin-password.js <email> <new-password>");
    process.exit(1);
  }
  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters (same rule the app enforces).");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Add it to .env.local in the project root, or run:\n" +
        '  DATABASE_URL="postgresql://..." node scripts/reset-admin-password.js <email> <new-password>'
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "disable" ? undefined : { rejectUnauthorized: false },
  });

  try {
    const existing = await pool.query("SELECT id, email, name FROM admin_users WHERE email = $1", [email]);
    if (existing.rows.length === 0) {
      console.error(`No admin account found with email "${email}".`);
      const all = await pool.query("SELECT email FROM admin_users ORDER BY email");
      if (all.rows.length > 0) {
        console.error("Existing admin emails:");
        for (const row of all.rows) console.error(`  - ${row.email}`);
      }
      process.exit(1);
    }

    // Same call the app itself uses (bcrypt, 10 salt rounds) — see hashPassword() in lib/auth.ts.
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    await pool.query("UPDATE admin_users SET password_hash = $1 WHERE email = $2", [passwordHash, email]);

    console.log(`✓ Password updated for ${existing.rows[0].name} <${email}>.`);
    console.log("You can log in with the new password now.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Failed to reset password:", err.message || err);
  process.exit(1);
});
