// api/engagements.js — Neon serverless, supports versioning
import { neon } from "@neondatabase/serverless";

function getDb(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

async function parseBody(req){
  return new Promise((resolve,reject)=>{
    let d="";
    req.on("data",c=>{d+=c;});
    req.on("end",()=>{try{resolve(d?JSON.parse(d):{});}catch(e){reject(e);}});
    req.on("error",reject);
  });
}

async function ensureTables(sql){
  await sql`
    CREATE TABLE IF NOT EXISTS opportunities (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      client_name TEXT,
      client_city TEXT,
      status      TEXT DEFAULT 'Draft',
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      payload     JSONB NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS opp_versions (
      id          SERIAL PRIMARY KEY,
      opp_id      TEXT NOT NULL,
      version     TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      payload     JSONB NOT NULL
    )
  `;
}

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  try{
    const sql=getDb();
    await ensureTables(sql);
    const url=new URL(req.url,"http://localhost");
    const id=req.query?.id||url.searchParams.get("id");
    const action=req.query?.action||url.searchParams.get("action");

    // ── GET ─────────────────────────────────────────────────────────────────
    if(req.method==="GET"){
      // GET versions for an opp
      if(id && action==="versions"){
        const rows=await sql`
          SELECT id,opp_id,version,created_at
          FROM opp_versions WHERE opp_id=${id}
          ORDER BY created_at DESC
        `;
        return res.status(200).json({versions:rows});
      }
      // GET one version payload
      if(action==="version" && id){
        const vid=req.query?.vid||url.searchParams.get("vid");
        const rows=await sql`SELECT payload FROM opp_versions WHERE id=${vid} AND opp_id=${id}`;
        if(!rows.length) return res.status(404).json({error:"Not found"});
        return res.status(200).json(rows[0].payload);
      }
      // GET one opp
      if(id){
        const rows=await sql`SELECT * FROM opportunities WHERE id=${id}`;
        if(!rows.length) return res.status(404).json({error:"Not found"});
        return res.status(200).json(rows[0]);
      }
      // GET all
      const rows=await sql`
        SELECT id,name,client_name,client_city,status,updated_at
        FROM opportunities ORDER BY updated_at DESC LIMIT 100
      `;
      return res.status(200).json({engagements:rows});
    }

    // ── POST ────────────────────────────────────────────────────────────────
    if(req.method==="POST"){
      const body=await parseBody(req);

      // Save a named version snapshot
      if(action==="version"){
        const {oppId,version,payload}=body;
        if(!oppId||!version||!payload)
          return res.status(400).json({error:"oppId, version and payload required"});
        await sql`
          INSERT INTO opp_versions (opp_id,version,payload)
          VALUES (${oppId},${version},${JSON.stringify(payload)}::jsonb)
        `;
        return res.status(200).json({success:true});
      }

      // Upsert opportunity
      const {id:oid,name,clientName,clientCity,status,payload}=body;
      if(!oid||!name||!payload)
        return res.status(400).json({error:"id, name and payload required"});
      await sql`
        INSERT INTO opportunities (id,name,client_name,client_city,status,updated_at,payload)
        VALUES (${oid},${name},${clientName||null},${clientCity||null},${status||"Draft"},NOW(),${JSON.stringify(payload)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, client_name=EXCLUDED.client_name,
          client_city=EXCLUDED.client_city, status=EXCLUDED.status,
          updated_at=NOW(), payload=EXCLUDED.payload
      `;
      return res.status(200).json({success:true,id:oid});
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if(req.method==="DELETE"){
      if(!id) return res.status(400).json({error:"id required"});
      await sql`DELETE FROM opp_versions WHERE opp_id=${id}`;
      await sql`DELETE FROM opportunities WHERE id=${id}`;
      return res.status(200).json({success:true});
    }

    return res.status(405).json({error:"Method not allowed"});
  }catch(err){
    console.error("API error:",err);
    return res.status(500).json({error:"Internal server error",detail:err.message});
  }
}
