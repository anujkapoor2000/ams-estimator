// src/pages/OpportunitiesPage.jsx
import { useState } from "react";
import { T, font, statusColor } from "../design.js";
import { Card, SectionHead, Btn, Input, Select, Search, StatusBadge, Modal, Table, Empty } from "../components/ui.jsx";
import { defaultOpp, calcBase, blendedSellRate, buildPlan } from "../store/appData.js";
import OppWizard from "../components/OppWizard.jsx";

const STATUSES=["Draft","Pipeline","Active","Won","Lost"];
function genId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

const versionColors={"Draft":T.amber,"V1":T.blue,"V2":T.teal,"Final":T.green};

function quickSell(o){
  try{
    const base=calcBase(o.mods,o.spS,o.spY,o.avgL2,o.avgL3,o.tkt);
    const intgHrs=(o.intgs||[]).length*60;
    const blendS=blendedSellRate(o.ls,o.rates,o.margins,o.fixedSell);
    const plan=buildPlan(base,intgHrs,o.ktMo,o.calMo,o.totalYrs,0,blendS,o.cont);
    return plan.reduce((s,r)=>s+r.sellWC,0);
  }catch(e){return 0;}
}

export default function OpportunitiesPage({opps,activeId,onSelect,onCreate,onUpdate,onDelete,onWizardSave,onWizardSubmit,sym}){
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("All");
  const [showNew,setShowNew]=useState(false);
  const [showDel,setShowDel]=useState(null);
  const [wizardOpp,setWizardOpp]=useState(null);
  const [form,setForm]=useState({name:"",client:"",clientCity:"",status:"Draft",currency:"USD"});

  const filtered=opps.filter(o=>{
    const ms=!search||o.name.toLowerCase().includes(search.toLowerCase())||o.client?.toLowerCase().includes(search.toLowerCase());
    const ms2=filterStatus==="All"||o.status===filterStatus;
    return ms&&ms2;
  });

  function handleCreate(){
    const id=genId();
    const o={...defaultOpp(id),name:form.name||"New Engagement",client:form.client,clientCity:form.clientCity,status:form.status,currency:form.currency||"USD"};
    onCreate(o);
    setShowNew(false);
    // Immediately open wizard for the new opp
    setWizardOpp(o);
    setForm({name:"",client:"",clientCity:"",status:"Draft",currency:"USD"});
  }

  function openWizard(opp){ setWizardOpp(opp); onSelect(opp.id); }

  const statusCounts=Object.fromEntries(STATUSES.map(s=>[s,opps.filter(o=>o.status===s).length]));
  const totalPipeline=opps.reduce((s,o)=>s+quickSell(o),0);

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="Opportunities" sub={"Manage your AMS engagement pipeline · "+opps.length+" total"}
        action={<Btn icon="+" onClick={()=>setShowNew(true)}>New Opportunity</Btn>}/>

      {/* Status summary */}
      <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}>
        {STATUSES.map(s=>{
          const col=statusColor(s);const cnt=statusCounts[s]||0;
          return(<div key={s} style={{background:T.white,borderRadius:T.r,border:`1px solid ${T.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,borderLeftColor:col.text,borderLeftWidth:3}}>
            <div style={{fontSize:18,fontWeight:800,color:col.text,fontFamily:font.display}}>{cnt}</div>
            <div style={{fontSize:11,color:T.textSoft,fontWeight:600}}>{s}</div>
          </div>);
        })}
        <div style={{background:T.blueSoft,borderRadius:T.r,border:`1px solid ${T.blueMid}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,borderLeftColor:T.blue,borderLeftWidth:3,marginLeft:"auto"}}>
          <div style={{fontSize:18,fontWeight:800,color:T.blue,fontFamily:font.display}}>{sym}{(totalPipeline/1000000).toFixed(1)}M</div>
          <div style={{fontSize:11,color:T.textSoft,fontWeight:600}}>Pipeline Value</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <Search value={search} onChange={setSearch} placeholder="Search opportunities..."/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {["All",...STATUSES].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${filterStatus===s?T.blue:T.border}`,background:filterStatus===s?T.blue:T.white,color:filterStatus===s?"white":T.textMid,fontFamily:font.body,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length===0
        ?<Empty icon="🔍" title="No opportunities found" sub={search?"Try a different search":"Create your first opportunity"} action={!search&&<Btn onClick={()=>setShowNew(true)}>+ New Opportunity</Btn>}/>
        :<Card style={{padding:0,overflow:"hidden"}}>
          <Table headers={["Opportunity","Client","Status","Version","Value","Years","Updated","Actions"]}
            rows={filtered.map(o=>{
              const val=quickSell(o);
              const ver=o.version||"Draft";
              return[
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  <div style={{fontWeight:700,color:T.text,fontSize:12}}>{o.name}</div>
                  {o.engRef&&<div style={{fontSize:10,color:T.textSoft}}>{o.engRef}</div>}
                </div>,
                <div>
                  <div style={{fontWeight:600,color:T.text,fontSize:12}}>{o.client||"—"}</div>
                  {o.clientCity&&<div style={{fontSize:10,color:T.textSoft}}>{o.clientCity}</div>}
                </div>,
                <StatusBadge status={o.status}/>,
                <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:100,background:(versionColors[ver]||T.blue)+"14",border:`1px solid ${(versionColors[ver]||T.blue)}30`,fontSize:10,fontWeight:700,color:versionColors[ver]||T.blue}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:versionColors[ver]||T.blue}}/>{ver}
                </span>,
                val>0?<span style={{fontWeight:700,color:T.blue,fontSize:12}}>{sym}{(val/1000000).toFixed(2)}M</span>:<span style={{color:T.textSoft}}>—</span>,
                <span style={{color:T.text}}>{o.totalYrs||3}y</span>,
                <span style={{fontSize:10,color:T.textSoft}}>{new Date(o.updatedAt||o.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>,
                <div style={{display:"flex",gap:5}}>
                  <Btn size="sm" variant={activeId===o.id?"primary":"secondary"} onClick={e=>{e.stopPropagation();openWizard(o);}}>
                    {activeId===o.id?"Edit ✎":"Open →"}
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setShowDel(o.id);}}>🗑</Btn>
                </div>,
              ];
            })} compact/>
        </Card>
      }

      {/* New opportunity modal */}
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Create New Opportunity" width={460}>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <Input label="Opportunity Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Zurich Insurance AMS"/>
          <Input label="Client Name" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="e.g. Zurich Insurance Group"/>
          <Input label="Client City" value={form.clientCity} onChange={e=>setForm(f=>({...f,clientCity:e.target.value}))} placeholder="e.g. Zurich, Switzerland"/>
          <Select label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={STATUSES.map(s=>({value:s,label:s}))}/>
          <Select label="Currency" value={form.currency||"USD"} onChange={v=>setForm(f=>({...f,currency:v}))} options={[{value:"USD",label:"USD $"},{value:"GBP",label:"GBP £"}]}/>
          <div style={{marginTop:8,padding:"10px 12px",background:T.blueSoft,borderRadius:T.r,fontSize:11,color:T.blueDark}}>
            After creating, you'll be taken through the 5-step configuration wizard.
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
            <Btn variant="secondary" onClick={()=>setShowNew(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.name}>Create & Configure →</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!showDel} onClose={()=>setShowDel(null)} title="Delete Opportunity" width={380}>
        <div>
          <p style={{fontSize:13,color:T.textMid,marginBottom:20}}>Are you sure? This will delete the opportunity and all its version history.</p>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="secondary" onClick={()=>setShowDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={()=>{onDelete(showDel);setShowDel(null);}}>Delete</Btn>
          </div>
        </div>
      </Modal>

      {/* Wizard */}
      {wizardOpp&&(
        <OppWizard
          opp={wizardOpp}
          open={!!wizardOpp}
          onClose={()=>setWizardOpp(null)}
          onSave={async(d)=>{ onWizardSave(d); setWizardOpp(d); }}
          onSubmitVersion={async(d)=>{ await onWizardSubmit(d); setWizardOpp(null); }}
          sym={sym}/>
      )}
    </div>
  );
}
