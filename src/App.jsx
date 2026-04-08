import { useState, useEffect } from "react";
import { T, font } from "./design.js";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import OppWizard from "./components/OppWizard.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OpportunitiesPage from "./pages/OpportunitiesPage.jsx";
import { AnalyticsPage, CostPage, TeamPage, AIPage, KTPage, RACIPage } from "./pages/OtherPages.jsx";
import { defaultOpp } from "./store/appData.js";
import { exportOppToPptx, exportOppToPdf } from "./exportNew.js";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800&display=swap";
const FX_API   = "https://open.er-api.com/v6/latest/USD";
const API      = "/api/engagements";

function genId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

async function pbody(res){ try{ return await res.json(); }catch(e){ return {}; } }
async function apiSave(opp){
  const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id:opp.id,name:opp.name,clientName:opp.client||"",clientCity:opp.clientCity||"",status:opp.status||"Draft",payload:opp})});
  return r.ok;
}
async function apiSaveVersion(oppId,version,payload){
  await fetch(API+"?action=version",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({oppId,version,payload})});
}
async function apiList(){
  const r=await fetch(API); if(!r.ok)return[];
  const d=await pbody(r); return d.engagements||[];
}
async function apiLoad(id){
  const r=await fetch(API+"?id="+id); if(!r.ok)return null;
  const d=await pbody(r); return d.payload||null;
}
async function apiDelete(id){ await fetch(API+"?id="+id,{method:"DELETE"}); }
async function apiVersions(id){
  const r=await fetch(API+"?id="+id+"&action=versions"); if(!r.ok)return[];
  const d=await pbody(r); return d.versions||[];
}

export default function App(){
  const [page,setPage]       = useState("opportunities");
  const [opps,setOpps]       = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [wizardOpp,setWizardOpp] = useState(null); // opp being edited in wizard
  const [saving,setSaving]   = useState(false);
  const [loading,setLoading] = useState(true);
  const [currency,setCurrency] = useState("USD");
  const [fxRate,setFxRate]   = useState(null);      // USD→GBP rate
  const [fxUpdated,setFxUpdated] = useState(null);
  const [fxLoading,setFxLoading] = useState(false);

  const activeOpp = opps.find(o=>o.id===activeId)||null;
  const sym = currency==="USD"?"$":"£";

  // ── Fetch exchange rate ──────────────────────────────────────────────────────
  async function fetchFxRate(){
    setFxLoading(true);
    try{
      const r=await fetch(FX_API);
      const d=await r.json();
      if(d.rates?.GBP){
        setFxRate(d.rates.GBP);
        setFxUpdated(new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}));
      }
    }catch(e){ console.error("FX fetch failed",e); }
    finally{ setFxLoading(false); }
  }

  useEffect(()=>{ fetchFxRate(); },[]);

  // Convert a value based on current currency
  function toDisplay(usdVal){ return currency==="GBP"&&fxRate?usdVal*fxRate:usdVal; }

  // ── Load opportunities ────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const list=await apiList();
        if(list.length>0){
          const full=await Promise.all(list.map(async l=>{
            const p=await apiLoad(l.id);
            return p||{...defaultOpp(l.id),name:l.name,client:l.client_name||"",status:l.status||"Draft"};
          }));
          setOpps(full);
          setActiveId(full[0].id);
        } else {
          const s={...defaultOpp(genId()),name:"Sample Engagement",client:"",status:"Draft"};
          setOpps([s]); setActiveId(s.id);
        }
      }catch(e){
        const s={...defaultOpp(genId()),name:"Sample Engagement",client:"",status:"Draft"};
        setOpps([s]); setActiveId(s.id);
      }finally{ setLoading(false); }
    })();
  },[]);

  // ── Opportunity CRUD ──────────────────────────────────────────────────────────
  function updateOpp(id,patch){
    setOpps(p=>p.map(o=>o.id===id?{...o,...patch,updatedAt:new Date().toISOString()}:o));
  }
  function createOpp(opp){ setOpps(p=>[opp,...p]); setActiveId(opp.id); }
  function deleteOpp(id){ setOpps(p=>p.filter(o=>o.id!==id)); if(activeId===id){const r=opps.filter(o=>o.id!==id);setActiveId(r[0]?.id||null);} }
  function selectOpp(id){ setActiveId(id); setPage("dashboard"); }

  // Open wizard for an opportunity
  function openWizard(id){
    const opp=opps.find(o=>o.id===id);
    if(opp) setWizardOpp({...opp});
  }

  // ── Wizard handlers ───────────────────────────────────────────────────────────
  async function wizardSave(updated){
    setOpps(p=>p.map(o=>o.id===updated.id?updated:o));
    await apiSave(updated);
  }

  async function wizardSubmit(updated){
    setOpps(p=>p.map(o=>o.id===updated.id?updated:o));
    await apiSave(updated);
    // Save a version snapshot
    await apiSaveVersion(updated.id, updated.version||"Draft", updated);
    setActiveId(updated.id);
    setPage("dashboard");
    setWizardOpp(null);
  }

  // ── Save current state ────────────────────────────────────────────────────────
  async function handleSave(){
    if(!activeOpp)return;
    setSaving(true);
    try{ await apiSave({...activeOpp,updatedAt:new Date().toISOString()}); }
    finally{ setSaving(false); }
  }

  async function handleExport(type){
    if(!activeOpp){ alert("Please select an opportunity first."); return; }
    try{
      if(type==="pdf") await exportOppToPdf(activeOpp, currency, fxRate);
      else             await exportOppToPptx(activeOpp, currency, fxRate);
    }catch(err){
      console.error("Export error:", err);
      alert("Export failed: "+err.message);
    }
  }

  // ── Currency toggle ───────────────────────────────────────────────────────────
  function toggleCurrency(){
    if(currency==="USD"){ setCurrency("GBP"); if(!fxRate)fetchFxRate(); }
    else setCurrency("USD");
  }

  if(loading){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:14}}>
        <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${T.blue}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
        <div style={{fontSize:12,color:T.textSoft}}>Loading engagements...</div>
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
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:100px;background:${T.border};cursor:pointer;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.blue};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.borderMid};}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        <Sidebar page={page} onPage={setPage} opp={activeOpp}/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <Navbar
            page={page} opp={activeOpp}
            onSave={handleSave} onExport={handleExport}
            saving={saving} currency={currency}
            onCurrencyToggle={toggleCurrency}
            fxRate={fxRate} fxUpdated={fxUpdated}
            fxLoading={fxLoading} onRefreshFx={fetchFxRate}/>

          <div style={{flex:1,overflowY:"auto"}}>
            {page==="dashboard"&&<DashboardPage opp={activeOpp} opps={opps} onPage={setPage} sym={sym} fxRate={fxRate} currency={currency} onEdit={()=>activeOpp&&openWizard(activeOpp.id)}/>}
            {page==="opportunities"&&<OpportunitiesPage opps={opps} activeId={activeId} onSelect={selectOpp} onCreate={o=>{createOpp(o);openWizard(o.id);}} onUpdate={updateOpp} onDelete={deleteOpp} onEdit={openWizard} sym={sym}/>}
            {page==="analytics"&&<AnalyticsPage opp={activeOpp} opps={opps} sym={sym}/>}
            {page==="cost"&&<CostPage opp={activeOpp} onUpdate={p=>activeId&&updateOpp(activeId,p)} sym={sym}/>}
            {page==="team"&&<TeamPage opp={activeOpp} onUpdate={p=>activeId&&updateOpp(activeId,p)} sym={sym}/>}
            {page==="ai"&&<AIPage opp={activeOpp} sym={sym}/>}
            {page==="kt"&&<KTPage opp={activeOpp} onUpdate={p=>activeId&&updateOpp(activeId,p)} sym={sym}/>}
            {page==="raci"&&<RACIPage opp={activeOpp}/>}
          </div>
        </div>
      </div>

      {/* Wizard overlay */}
      {wizardOpp&&(
        <OppWizard
          opp={wizardOpp}
          onSave={wizardSave}
          onClose={()=>setWizardOpp(null)}
          onSubmit={wizardSubmit}
          sym={sym}
          fxRate={fxRate}
          currency={currency}/>
      )}
    </>
  );
}
