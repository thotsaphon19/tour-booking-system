import { Pool, type QueryResultRow } from "pg";

// -----------------------------------------------------------------------------
// Database connection (PostgreSQL)
// -----------------------------------------------------------------------------
// Works with any standard Postgres provider — Neon, Supabase, Railway, RDS,
// or a local Postgres server. Set DATABASE_URL in your environment.
//
// On Vercel / other serverless hosts: use your provider's *pooled* connection
// string (e.g. Neon's "-pooler" host) to avoid exhausting connections across
// many concurrent function invocations. See DEPLOY.md for details.
// -----------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and set DATABASE_URL to your Postgres connection string."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString,
    // Most hosted Postgres providers (Neon, Supabase, RDS) require SSL.
    // Disabling certificate verification is standard practice for these
    // providers' connection strings; set PGSSL=disable for a fully local
    // Postgres install with no SSL configured at all.
    ssl: process.env.PGSSL === "disable" ? undefined : { rejectUnauthorized: false },
    max: 10,
  });
}

export const pool: Pool = global.__pgPool__ ?? createPool();
if (process.env.NODE_ENV !== "production") global.__pgPool__ = pool;

/** Run a parameterized query and return all rows. */
export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/** Run a parameterized query and return the first row, or null. */
export async function queryOne<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = initSchema();
  return schemaReady;
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tours (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      province TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      price INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'THB',
      max_group_size INTEGER NOT NULL DEFAULT 12,
      difficulty TEXT NOT NULL DEFAULT 'ปานกลาง',
      cover_image_url TEXT,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      itinerary_json TEXT NOT NULL DEFAULT '[]',
      includes_json TEXT NOT NULL DEFAULT '[]',
      excludes_json TEXT NOT NULL DEFAULT '[]',
      highlights_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      price_tiers_json TEXT NOT NULL DEFAULT '[]',
      difficulty_rating INTEGER NOT NULL DEFAULT 2,
      comfort_rating INTEGER NOT NULL DEFAULT 4,
      rating_score REAL,
      rating_count INTEGER,
      rating_source TEXT,
      hotel_name TEXT,
      hotel_description TEXT,
      hotel_images_json TEXT NOT NULL DEFAULT '[]',
      hotel_list_json TEXT NOT NULL DEFAULT '[]',
      agent_name TEXT,
      agent_role TEXT,
      agent_photo_url TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      video_url TEXT,
      tour_code TEXT,
      map_embed_url TEXT,
      translations_json TEXT NOT NULL DEFAULT '{}',
      departure_dates_json TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      travel_date TEXT NOT NULL,
      num_travelers INTEGER NOT NULL DEFAULT 1,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      request_type TEXT NOT NULL DEFAULT 'booking',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image_url TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      translations_json TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Admin',
      role TEXT NOT NULL DEFAULT 'admin',
      permissions_json TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_country TEXT,
      customer_photo_url TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      title TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL,
      travel_dates TEXT,
      featured INTEGER NOT NULL DEFAULT 1,
      translations_json TEXT NOT NULL DEFAULT '{}',
      customer_email TEXT,
      tour_id INTEGER,
      -- 'approved': shown on the public site (this is what every review
      -- created directly by an admin has always meant, so it stays the
      -- default — existing reviews aren't hidden by this migration).
      -- 'pending': submitted by a customer through the public review form,
      -- waiting for an admin to approve or reject it in /admin/reviews.
      -- 'rejected': reviewed and declined; kept around for the record but
      -- never shown publicly.
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trip_requests (
      id SERIAL PRIMARY KEY,
      title TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      nationality TEXT,
      travel_month TEXT,
      travel_year TEXT,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      infants INTEGER NOT NULL DEFAULT 0,
      budget TEXT,
      heard_about TEXT,
      special_requests TEXT,
      tour_slug TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      flight_ack TEXT,
      trip_length_days INTEGER,
      arrival_date TEXT,
      departure_date TEXT,
      traveler_count INTEGER,
      traveler_type TEXT,
      guide_preference TEXT,
      guide_language TEXT,
      hotel_level TEXT,
      currency TEXT,
      budget_per_person TEXT,
      places_of_interest TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS partner_embeds (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL DEFAULT '',
      html TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deletion_requests (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      entity_label TEXT NOT NULL DEFAULT '',
      requested_by INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      requested_by_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      resolved_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS tour_proposals (
      id SERIAL PRIMARY KEY,
      based_on_tour_id INTEGER REFERENCES tours(id) ON DELETE SET NULL,
      client_name TEXT NOT NULL DEFAULT '',
      client_email TEXT NOT NULL DEFAULT '',
      client_phone TEXT NOT NULL DEFAULT '',
      travel_start_date TEXT,
      travel_end_date TEXT,
      title TEXT NOT NULL DEFAULT '',
      cover_image_url TEXT,
      summary TEXT NOT NULL DEFAULT '',
      duration_days INTEGER NOT NULL DEFAULT 1,
      itinerary_json TEXT NOT NULL DEFAULT '[]',
      hotel_list_json TEXT NOT NULL DEFAULT '[]',
      includes_json TEXT NOT NULL DEFAULT '[]',
      excludes_json TEXT NOT NULL DEFAULT '[]',
      highlights_json TEXT NOT NULL DEFAULT '[]',
      price_amount NUMERIC NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'THB',
      group_size TEXT NOT NULL DEFAULT '',
      booking_policy TEXT NOT NULL DEFAULT '',
      payment_policy TEXT NOT NULL DEFAULT '',
      cancellation_policy TEXT NOT NULL DEFAULT '',
      insurance_policy TEXT NOT NULL DEFAULT '',
      visa_policy TEXT NOT NULL DEFAULT '',
      agent_name TEXT,
      agent_role TEXT,
      agent_photo_url TEXT,
      proposal_code TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id SERIAL PRIMARY KEY,
      visitor_name TEXT,
      visitor_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations (visitor_phone);

    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      direction TEXT NOT NULL,
      body TEXT NOT NULL,
      wa_message_id TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages (conversation_id, created_at);
  `);

  // Forward migrations for databases created before these columns existed.
  // Postgres supports "ADD COLUMN IF NOT EXISTS" natively, unlike SQLite.
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'country'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'province'
      ) THEN
        ALTER TABLE tours RENAME COLUMN country TO province;
      END IF;
    END $$;
  `);
  await pool.query(`
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_tiers_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER NOT NULL DEFAULT 2;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS comfort_rating INTEGER NOT NULL DEFAULT 4;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS rating_score REAL;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS rating_count INTEGER;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS rating_source TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_name TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_description TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_images_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_list_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS agent_name TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS agent_role TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS agent_photo_url TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS tags_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS tour_code TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS map_embed_url TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS translations_json TEXT NOT NULL DEFAULT '{}';
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS departure_dates_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions_json TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE news ADD COLUMN IF NOT EXISTS translations_json TEXT NOT NULL DEFAULT '{}';
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS translations_json TEXT NOT NULL DEFAULT '{}';
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_email TEXT;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tour_id INTEGER;
    -- Existing reviews were always admin-entered and already publicly
    -- visible, so they default to 'approved' — this migration doesn't hide
    -- anything that was already live on the site.
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS flight_ack TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS trip_length_days INTEGER;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS arrival_date TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS departure_date TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS traveler_count INTEGER;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS traveler_type TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS guide_preference TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS guide_language TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS hotel_level TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS currency TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS budget_per_person TEXT;
    ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS places_of_interest TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'booking';
  `);

  // Every install must have at least one super_admin — promote the
  // earliest-created admin automatically if none exists yet (covers both
  // brand-new installs and databases upgraded from before roles existed).
  await pool.query(`
    UPDATE admin_users SET role = 'super_admin'
    WHERE id = (SELECT id FROM admin_users ORDER BY id ASC LIMIT 1)
      AND NOT EXISTS (SELECT 1 FROM admin_users WHERE role = 'super_admin');
  `);
}
