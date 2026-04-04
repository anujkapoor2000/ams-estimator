// api/engagements.js
// Vercel Serverless Function — handles GET (list/fetch) and POST (save)
// Uses @vercel/postgres which connects to your Vercel Postgres (Neon) database
// Environment variable required: POSTGRES_URL (set automatically by Vercel Postgres integration)

import { sql } from "@vercel/postgres";

export const config = { runtime: "edge" };

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

export default async function handler(req) {
  try {
    await ensureTable();

    // ── GET /api/engagements          → list all (summary)
    // ── GET /api/engagements?id=xxx   → fetch one full payload
    if (req.method === "GET") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (id) {
        const { rows } = await sql`
          SELECT id, name, client_name, client_city, updated_at, payload
          FROM engagements WHERE id = ${id}
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(rows[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // List all — return summary only (no full payload)
      const { rows } = await sql`
        SELECT id, name, client_name, client_city, updated_at
        FROM engagements
        ORDER BY updated_at DESC
        LIMIT 50
      `;
      return new Response(JSON.stringify({ engagements: rows }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── POST /api/engagements → upsert (create or update)
    if (req.method === "POST") {
      const body = await req.json();
      const { id, name, clientName, clientCity, payload } = body;

      if (!id || !name || !payload) {
        return new Response(
          JSON.stringify({ error: "id, name and payload are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      await sql`
        INSERT INTO engagements (id, name, client_name, client_city, updated_at, payload)
        VALUES (${id}, ${name}, ${clientName || null}, ${clientCity || null}, NOW(), ${JSON.stringify(payload)})
        ON CONFLICT (id) DO UPDATE SET
          name        = EXCLUDED.name,
          client_name = EXCLUDED.client_name,
          client_city = EXCLUDED.client_city,
          updated_at  = NOW(),
          payload     = EXCLUDED.payload
      `;

      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── DELETE /api/engagements?id=xxx
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "id required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await sql`DELETE FROM engagements WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
