// api/engagements.js
// Vercel Serverless Function — Neon serverless driver
// Required env var: DATABASE_URL  (from your Neon project dashboard)
// npm install @neondatabase/serverless

import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(process.env.DATABASE_URL);
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS engagements (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      client_name TEXT,
      client_city TEXT,
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      payload     JSONB NOT NULL
    )
  `;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await ensureTable();

    // GET /api/engagements          → list all (summary)
    // GET /api/engagements?id=xxx   → fetch one full payload
    if (req.method === "GET") {
      const { id } = req.query;

      if (id) {
        const { rows } = await sql`
          SELECT id, name, client_name, client_city, updated_at, payload
          FROM engagements WHERE id = ${id}
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: "Not found" });
        }
        return res.status(200).json(rows[0]);
      }

      const { rows } = await sql`
        SELECT id, name, client_name, client_city, updated_at
        FROM engagements
        ORDER BY updated_at DESC
        LIMIT 50
      `;
      return res.status(200).json({ engagements: rows });
    }

    // POST /api/engagements → upsert
    if (req.method === "POST") {
      const { id, name, clientName, clientCity, payload } = req.body;

      if (!id || !name || !payload) {
        return res.status(400).json({ error: "id, name and payload are required" });
      }

      const payloadStr = JSON.stringify(payload);

      await sql`
        INSERT INTO engagements (id, name, client_name, client_city, updated_at, payload)
        VALUES (${id}, ${name}, ${clientName || null}, ${clientCity || null}, NOW(), ${payloadStr}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name        = EXCLUDED.name,
          client_name = EXCLUDED.client_name,
          client_city = EXCLUDED.client_city,
          updated_at  = NOW(),
          payload     = EXCLUDED.payload
      `;

      return res.status(200).json({ success: true, id });
    }

    // DELETE /api/engagements?id=xxx
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "id required" });
      }
      await sql`DELETE FROM engagements WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
