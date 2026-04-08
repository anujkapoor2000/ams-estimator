// api/versions.js — stores per-version snapshots for each opportunity
import { neon } from "@neondatabase/serverless";

function getDb(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

async function parseBody(req){
  return new Promise((res,rej)=>{
    let d="";
    req.on("data",c=>{d+=c;});
    req.on("end",()=>{try{res(d?JSON.parse(d):{});}catch(e){rej(e);}});
    req.on("error",rej);
  });
}

async function ensureTables(sql){
  await sql`
    CREATE TABLE IF NOT EXISTS opp_versions (
      id           TEXT PRIMARY KEY,
      opp_id       TEXT NOT NULL,
      version_label TEXT NOT NULL,
      version_num  INTEGER NOT NULL,
      name         TEXT,
      client_name  TEXT,
      client_city  TEXT,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      payload      JSONB NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_opp_versions_opp_id ON opp_versions(opp_id)`;
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  try{
    const sql=getDb();
    await ensureTables(sql);

    // GET /api/versions?oppId=xxx  → list versions for an opportunity
    // GET /api/versions?id=xxx     → get one version payload
    if(req.method==="GET"){
      const {oppId, id}=req.query||{};
      if(id){
        const rows=await sql`SELECT * FROM opp_versions WHERE id=${id}`;
        if(!rows.length) return res.status(404).json({error:"Not found"});
        return res.status(200).json(rows[0]);
      }
      if(oppId){
        const rows=await sql`SELECT id,opp_id,version_label,version_num,name,client_name,client_city,created_at FROM opp_versions WHERE opp_id=${oppId} ORDER BY version_num DESC`;
        return res.status(200).json({versions:rows});
      }
      return res.status(400).json({error:"oppId or id required"});
    }

    // POST /api/versions → create a new version snapshot
    if(req.method==="POST"){
      const body=await parseBody(req);
      const {id,oppId,versionLabel,versionNum,name,clientName,clientCity,payload}=body;
      if(!id||!oppId||!versionLabel||!payload) return res.status(400).json({error:"Missing required fields"});
      const payloadJson=JSON.stringify(payload);
      await sql`
        INSERT INTO opp_versions(id,opp_id,version_label,version_num,name,client_name,client_city,created_at,payload)
        VALUES(${id},${oppId},${versionLabel},${versionNum||0},${name||null},${clientName||null},${clientCity||null},NOW(),${payloadJson}::jsonb)
        ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,created_at=NOW()
      `;
      return res.status(200).json({success:true,id});
    }

    // DELETE /api/versions?id=xxx
    if(req.method==="DELETE"){
      const {id}=req.query||{};
      if(!id) return res.status(400).json({error:"id required"});
      await sql`DELETE FROM opp_versions WHERE id=${id}`;
      return res.status(200).json({success:true});
    }

    return res.status(405).json({error:"Method not allowed"});
  }catch(err){
    console.error("versions API error:",err);
    return res.status(500).json({error:"Internal server error",detail:err.message});
  }
}
