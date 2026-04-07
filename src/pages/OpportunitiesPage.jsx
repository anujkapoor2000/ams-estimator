// src/pages/OpportunitiesPage.jsx
import { useState } from "react";
import { T, font, statusColor } from "../design.js";
import { Card, SectionHead, Btn, Input, Select, Search, StatusBadge, Modal, Table, Empty } from "../components/ui.jsx";
import { CLIENT_REGIONS, calcBase, blendedSellRate, LOCATIONS, buildPlan, FTE_HRS, defaultOpp } from "../store/appData.js";

const STATUSES = ["Draft","Pipeline","Active","Won","Lost"];

function newId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

export default function OpportunitiesPage({opps,activeId,onSelect,onCreate,onUpdate,onDelete,sym}){
  const [search,setSearch] = useState("");
  const [filterStatus,setFilterStatus] = useState("All");
  const [showNew,setShowNew] = useState(false);
  const [showDel,setShowDel] = useState(null);
  const [form,setForm] = useState({name:"",client:"",clientCity:"",status:"Draft",currency:"USD"});

  const filtered = opps.filter(o=>{
    const matchSearch=!search||o.name.toLowerCase().includes(search.toLowerCase())||o.client?.toLowerCase().includes(search.toLowerCase());
    const matchStatus=filterStatus==="All"||o.status===filterStatus;
    return matchSearch&&matchStatus;
  });

  function handleCreate(){
    const id=newId();
    const o={...defaultOpp(id),name:form.name||"New Engagement",client:form.client,clientCity:form.clientCity,status:form.status,currency:form.currency||"USD"};
    onCreate(o);
    setShowNew(false);
    setForm({name:"",client:"",clientCity:"",status:"Draft",currency:"USD"});
  }

  function quickValue(o){
    try{
      const base=calcBase(o.mods,o.spS,o.spY,o.avgL2,o.avgL3,o.tkt);
      const intgHrs=(o.intgs||[]).length*60;
      const blendS=blendedSellRate(o.ls,o.rates,o.margins,o.fixedSell);
      const plan=buildPlan(base,intgHrs,o.ktMo,o.calMo,o.totalYrs,0,blendS,o.cont);
      return plan.reduce((s,r)=>s+r.sellWC,0);
    }catch(e){return 0;}
  }

  const tableRows = filtered.map(o=>{
    const val = quickValue(o);
    const annBase = (o.mods||[]).length>0?Math.round((calcBase(o.mods,o.spS,o.spY,o.avgL2,o.avgL3,o.tkt).totalL2+calcBase(o.mods,o.spS,o.spY,o.avgL2,o.avgL3,o.tkt).totalL3+calcBase(o.mods,o.spS,o.spY,o.avgL2,o.avgL3,o.tkt).totalEnh+(o.intgs||[]).length*60)/FTE_HRS*10)/10:0;
    return [
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        <div style={{fontWeight:700,color:T.text,fontSize:12}}>{o.name}</div>
        {o.engRef&&<div style={{fontSize:10,color:T.textSoft}}>{o.engRef}</div>}
      </div>,
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        <div style={{fontWeight:600,color:T.text,fontSize:12}}>{o.client||"—"}</div>
        {o.clientCity&&<div style={{fontSize:10,color:T.textSoft}}>{o.clientCity}</div>}
      </div>,
      <StatusBadge status={o.status}/>,
      val>0?<span style={{fontWeight:700,color:T.blue}}>{sym}{(val/1000000).toFixed(2)}M</span>:<span style={{color:T.textSoft}}>—</span>,
      <span style={{color:T.text}}>{o.totalYrs}y</span>,
      <span style={{color:T.text}}>{annBase} FTE</span>,
      <div style={{fontSize:10,color:T.textSoft}}>{new Date(o.updatedAt||o.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>,
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        <Btn size="sm" variant={activeId===o.id?"primary":"secondary"} onClick={e=>{e.stopPropagation();onSelect(o.id);}}>
          {activeId===o.id?"Active":"Open"}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setShowDel(o.id);}}>🗑</Btn>
      </div>,
    ];
  });

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead
        title="Opportunities"
        sub={"Track and manage your AMS engagement pipeline · "+opps.length+" total"}
        action={<Btn icon="+" onClick={()=>setShowNew(true)}>New Opportunity</Btn>}/>

      {/* Stats row */}
      <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        {STATUSES.map(s=>{
          const count=opps.filter(o=>o.status===s).length;
          const col=statusColor(s);
          return(<div key={s} style={{...{background:T.bgCard,borderRadius:T.r,border:`1px solid ${T.border}`,padding:"12px 18px",display:"flex",alignItems:"center",gap:12},borderLeftColor:col.text,borderLeftWidth:3}}>
            <div style={{fontSize:20,fontWeight:800,color:col.text,fontFamily:font.display}}>{count}</div>
            <div style={{fontSize:12,color:T.textSoft,fontWeight:600}}>{s}</div>
          </div>);
        })}
        <div style={{background:T.blueSoft,borderRadius:T.r,border:`1px solid ${T.blueMid}`,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,borderLeftColor:T.blue,borderLeftWidth:3,marginLeft:"auto"}}>
          <div style={{fontSize:20,fontWeight:800,color:T.blue,fontFamily:font.display}}>{sym}{(opps.reduce((s,o)=>s+quickValue(o),0)/1000000).toFixed(1)}M</div>
          <div style={{fontSize:12,color:T.textSoft,fontWeight:600}}>Total Pipeline</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <Search value={search} onChange={setSearch} placeholder="Search opportunities..."/>
        <div style={{display:"flex",gap:6}}>
          {["All",...STATUSES].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${filterStatus===s?T.blue:T.border}`,background:filterStatus===s?T.blue:T.white,color:filterStatus===s?"white":T.textMid,fontFamily:font.body,fontSize:11,fontWeight:600,cursor:"pointer"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length===0?(
        <Empty icon="🔍" title="No opportunities found" sub={search?"Try a different search term":"Create your first opportunity to get started"} action={!search&&<Btn onClick={()=>setShowNew(true)}>+ New Opportunity</Btn>}/>
      ):(
        <Card style={{padding:0,overflow:"hidden"}}>
          <Table
            headers={["Opportunity","Client","Status","Value","Years","Team","Updated","Actions"]}
            rows={tableRows}
            compact/>
        </Card>
      )}

      {/* New opportunity modal */}
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="New Opportunity" width={460}>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <Input label="Opportunity Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Zurich Insurance AMS"/>
          <Input label="Client Name" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="e.g. Zurich Insurance Group"/>
          <Input label="Client City" value={form.clientCity} onChange={e=>setForm(f=>({...f,clientCity:e.target.value}))} placeholder="e.g. Zurich, Switzerland"/>
          <Select label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={STATUSES.map(s=>({value:s,label:s}))}/>
          <Select label="Currency" value={form.currency||"USD"} onChange={v=>setForm(f=>({...f,currency:v}))} options={[{value:"USD",label:"USD $"},{value:"GBP",label:"GBP £"}]}/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
            <Btn variant="secondary" onClick={()=>setShowNew(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.name}>Create Opportunity</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!showDel} onClose={()=>setShowDel(null)} title="Delete Opportunity" width={400}>
        <div>
          <p style={{fontSize:13,color:T.textMid,marginBottom:20}}>Are you sure you want to delete this opportunity? This action cannot be undone.</p>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="secondary" onClick={()=>setShowDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={()=>{onDelete(showDel);setShowDel(null);}}>Delete</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
