import { useState, useEffect } from "react";
import { T, font } from "./design.js";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OpportunitiesPage from "./pages/OpportunitiesPage.jsx";
import { AnalyticsPage, CostPage, TeamPage, AIPage, KTPage, RACIPage } from "./pages/OtherPages.jsx";
import { defaultOpp } from "./store/appData.js";

// ─── Google Fonts loader ───────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";

// ─── Persistence helpers ───────────────────────────────────────────────────────
const DB_KEY  = "/api/engagements";
function genId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

async function parseBody(res){ try{ return await res.json(); }catch(e){ return{}; } }

async function apiSave(opp){
  const r=await fetch(DB_KEY,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:opp.id,name:opp.name,clientName:opp.client||"",clientCity:opp.clientCity||"",payload:opp})});
  return r.ok;
}
async function apiList(){
  const r=await fetch(DB_KEY);
  if(!r.ok)return[];
  const d=await parseBody(r);
  return d.engagements||[];
}
async function apiLoad(id){
  const r=await fetch(DB_KEY+"?id="+id);
  if(!r.ok)return null;
  const d=await parseBody(r);
  return d.payload||null;
}
async function apiDelete(id){
  await fetch(DB_KEY+"?id="+id,{method:"DELETE"});
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App(){
  const [page, setPage]     = useState("opportunities");
  const [opps, setOpps]     = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");

  const sym = currency==="USD"?"$":"£";
  const activeOpp = opps.find(o=>o.id===activeId)||null;

  // Load all opportunities on mount
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const list=await apiList();
        if(list.length>0){
          // Load full payloads for each
          const full=await Promise.all(list.map(async l=>{
            const p=await apiLoad(l.id);
            return p||{...defaultOpp(l.id),name:l.name,client:l.client_name||"",clientCity:l.client_city||""};
          }));
          setOpps(full);
          setActiveId(full[0].id);
        } else {
          // Create a starter opportunity
          const starter={...defaultOpp(genId()),name:"My First Engagement",client:"",status:"Draft"};
          setOpps([starter]);
          setActiveId(starter.id);
        }
      }catch(e){
        const starter={...defaultOpp(genId()),name:"My First Engagement",client:"",status:"Draft"};
        setOpps([starter]);
        setActiveId(starter.id);
      }finally{
        setLoading(false);
      }
    })();
  },[]);

  function updateOpp(id,patch){
    setOpps(p=>p.map(o=>o.id===id?{...o,...patch,updatedAt:new Date().toISOString()}:o));
  }

  function createOpp(opp){ setOpps(p=>[opp,...p]); setActiveId(opp.id); setPage("dashboard"); }
  function deleteOpp(id){ setOpps(p=>p.filter(o=>o.id!==id)); if(activeId===id){const rest=opps.filter(o=>o.id!==id);setActiveId(rest[0]?.id||null);} }
  function selectOpp(id){ setActiveId(id); setPage("dashboard"); }

  async function handleSave(){
    if(!activeOpp)return;
    setSaving(true);
    try{ await apiSave({...activeOpp,updatedAt:new Date().toISOString()}); }
    finally{ setSaving(false); }
  }

  async function handleExport(type){
    alert(type.toUpperCase()+" export — available in the Vercel-deployed build.");
  }

  function updateActive(patch){ if(activeId)updateOpp(activeId,patch); }

  if(loading){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:16}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:`3px solid ${T.blue}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
        <div style={{fontSize:13,color:T.textSoft}}>Loading engagements...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return(
    <>
      <link href={FONT_URL} rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans','Segoe UI',sans-serif;background:${T.bg};color:${T.text};}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:100px;background:${T.border};}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.blue};cursor:pointer;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.borderMid};}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        {/* Sidebar */}
        <Sidebar page={page} onPage={setPage} opp={activeOpp}/>

        {/* Main content area */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Navbar */}
          <Navbar
            page={page}
            opp={activeOpp}
            onSave={handleSave}
            onExport={handleExport}
            saving={saving}
            currency={currency}
            onCurrencyToggle={()=>setCurrency(c=>c==="USD"?"GBP":"USD")}/>

          {/* Page content */}
          <div style={{flex:1,overflowY:"auto"}}>
            {page==="dashboard"     && <DashboardPage     opp={activeOpp} opps={opps} onPage={setPage} sym={sym}/>}
            {page==="opportunities" && <OpportunitiesPage opps={opps} activeId={activeId} onSelect={selectOpp} onCreate={createOpp} onUpdate={updateOpp} onDelete={deleteOpp} sym={sym}/>}
            {page==="analytics"     && <AnalyticsPage     opp={activeOpp} opps={opps} sym={sym}/>}
            {page==="cost"          && <CostPage          opp={activeOpp} onUpdate={updateActive} sym={sym}/>}
            {page==="team"          && <TeamPage          opp={activeOpp} onUpdate={updateActive} sym={sym}/>}
            {page==="ai"            && <AIPage            opp={activeOpp} sym={sym}/>}
            {page==="kt"            && <KTPage            opp={activeOpp} onUpdate={updateActive} sym={sym}/>}
            {page==="raci"          && <RACIPage          opp={activeOpp}/>}
          </div>
        </div>
      </div>
    </>
  );
}
