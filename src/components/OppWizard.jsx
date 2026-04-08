// src/components/OppWizard.jsx
// 5-step wizard: Scope → Rates & Team → AI Accelerators → Phases → Review & Submit
import { useState } from "react";
import { T, font } from "../design.js";
import { Btn, Slider } from "./ui.jsx";
import {
  MODULES, INTEGRATIONS, COVERAGE_OPTIONS, LOCATIONS, DELIVERY_CENTRES,
  ROLES, RISKS, DEFAULT_AI_ACCELERATORS,
  buildPlan, calcBase, blendedCostRate, blendedSellRate, getSellRate,
  splitFTERounded, roundFTE, FTE_HRS, VERSION_LABELS,
} from "../store/appData.js";

const STEPS = [
  {n:1,label:"Scope",        icon:"📋"},
  {n:2,label:"Rates & Team", icon:"👥"},
  {n:3,label:"AI & Gains",   icon:"⚡"},
  {n:4,label:"Phases",       icon:"📅"},
  {n:5,label:"Review",       icon:"✅"},
];

const VERSION_COLORS = {Draft:T.textSoft, V1:T.blue, V2:T.teal, Final:T.green};
const VERSION_BG     = {Draft:"#F1F5F9",  V1:"#DBEAFE", V2:"#CCFBF1", Final:"#D1FAE5"};
const RACI_C = {R:"#10B981",A:"#EF4444",C:"#F59E0B",I:T.textSoft};
const RISK_C = {High:"#EF4444",Medium:"#F59E0B",Low:"#10B981"};
const IMPACT_OPTS = ["Low","Medium","High","Transformational"];
const TIMELINE_OPTS = ["Y1 Q1","Y1 Q2","Y1 Q3","Y1 Q4","Y2 Q1","Y2 Q2","Y3 Q1","Y3 Q2"];

function sL(txt){ return <div style={{fontSize:10,fontWeight:700,color:T.textSoft,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,marginTop:4}}>{txt}</div>; }
function NI({pre,val,onChange,clr,ph}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      {pre&&<span style={{fontSize:10,color:T.textSoft}}>{pre}</span>}
      <input type="number" value={val===null||val===undefined?"":val} placeholder={ph||""} onChange={e=>onChange(e.target.value===""?null:Number(e.target.value))}
        style={{width:"100%",padding:"6px 8px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:12,fontWeight:700,color:clr||T.text,outline:"none"}}/>
    </div>
  );
}
function IS(v){ return {width:"100%",padding:"7px 10px",border:`1.5px solid ${v?T.blue:T.border}`,borderRadius:T.r,fontSize:12,color:T.text,outline:"none",fontFamily:"'DM Sans',sans-serif"}; }
function genId(){ return "acc_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }

// ── Step helpers ──────────────────────────────────────────────────────────────
function calcDerived(data){
  const base=calcBase(data.mods||[],data.spS,data.spY,data.avgL2,data.avgL3,data.tkt);
  const intgHrs=(data.intgs||[]).length*60;
  const annBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const blendC=blendedCostRate(data.ls,data.rates);
  const blendS=blendedSellRate(data.ls,data.rates,data.margins,data.fixedSell);
  const baseFTE=roundFTE(annBase/FTE_HRS);
  const plan=buildPlan(base,intgHrs,data.ktMo,data.calMo,data.totalYrs,blendC,blendS,data.cont,data.ls,data.accelerators);
  const locFTEs=splitFTERounded(baseFTE,data.ls);
  return{base,intgHrs,annBase,blendC,blendS,baseFTE,plan,locFTEs};
}

function updSplit(data,key,val){
  const oth=LOCATIONS.filter(l=>l.key!==key);
  const rem=100-val; const c2=oth.reduce((s,l)=>s+data.ls[l.key],0);
  const ns={...data.ls,[key]:val};
  if(c2>0){oth.forEach(l=>{ns[l.key]=Math.round((data.ls[l.key]/c2)*rem);});}
  else{const eq=Math.floor(rem/oth.length);oth.forEach((l,i)=>{ns[l.key]=i===oth.length-1?rem-eq*(oth.length-1):eq;});}
  return ns;
}

// ── Step 1: Scope ─────────────────────────────────────────────────────────────
function Step1({data,patch}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
      <div>
        {sL("GW Modules in Scope")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:18}}>
          {MODULES.map(m=>{const on=(data.mods||[]).includes(m);return(
            <button key={m} onClick={()=>patch({mods:on?(data.mods||[]).filter(x=>x!==m):[...(data.mods||[]),m]})}
              style={{padding:"10px 11px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blue:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",flexShrink:0}}>{on?"✓":""}</div>
                <span style={{fontSize:12,fontWeight:on?700:500,color:on?T.blue:T.text}}>{m}</span>
              </div>
            </button>
          );})}
        </div>
        {sL("Cloud Integrations")}
        {INTEGRATIONS.map(i=>{const on=(data.intgs||[]).includes(i);return(
          <label key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:T.r,background:on?T.blueSoft:T.bg,border:`1px solid ${on?T.blueMid:T.border}`,cursor:"pointer",marginBottom:5,transition:"all 0.15s"}}>
            <input type="checkbox" checked={on} onChange={()=>patch({intgs:on?(data.intgs||[]).filter(x=>x!==i):[...(data.intgs||[]),i]})} style={{accentColor:T.blue,width:13,height:13}}/>
            <span style={{fontSize:11,fontWeight:on?600:400,color:on?T.blue:T.text}}>{i}</span>
          </label>
        );})}
      </div>
      <div>
        {sL("Engagement Configuration")}
        <Slider label="Engagement Years" min={1} max={7} value={data.totalYrs} onChange={v=>patch({totalYrs:v})} unit=" yrs"/>
        <Slider label="Tickets / Month"  min={10} max={300} step={5} value={data.tkt} onChange={v=>patch({tkt:v})} unit=""/>
        <Slider label="Story Points / Sprint" min={10} max={50} value={data.spS} onChange={v=>patch({spS:v})} unit=" SP"/>
        <Slider label="Sprints / Year"   min={12} max={26} value={data.spY} onChange={v=>patch({spY:v})} unit=""/>
        <Slider label="Avg L2 Resolution" min={1} max={16} value={data.avgL2} onChange={v=>patch({avgL2:v})} unit=" hrs" hint="Break-fix"/>
        <Slider label="Avg L3 Resolution" min={4} max={40} value={data.avgL3} onChange={v=>patch({avgL3:v})} unit=" hrs" hint="Gosu/dev"/>
        <div style={{marginTop:14}}>
          {sL("Service Coverage Model")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {COVERAGE_OPTIONS.map(o=>{const on=data.covKey===o.key;return(
              <button key={o.key} onClick={()=>patch({covKey:o.key})}
                style={{padding:"9px 10px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:10,fontWeight:700,color:on?T.blue:T.text,marginBottom:2}}>{o.label}</div>
                <div style={{fontSize:8,color:T.textSoft}}>{o.desc}</div>
                <div style={{fontSize:9,fontWeight:600,color:on?T.blue:T.textSoft,marginTop:2}}>{o.annualHrs.toLocaleString()} hrs/yr</div>
              </button>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Rates & Team ──────────────────────────────────────────────────────
function Step2({data,patch,sym,cvt}){
  const {baseFTE,locFTEs,blendC,blendS,plan}=calcDerived(data);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const blendMP=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  return(
    <div>
      {/* Summary bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16,padding:"12px 14px",background:T.blueSoft,borderRadius:T.rMd}}>
        {[["Baseline FTEs",baseFTE,T.blue],["Cost/hr",sym+Math.round(cvt(blendC)),T.blueDark],["Sell/hr",sym+Math.round(cvt(blendS)),T.green],["Margin",blendMP+"%","#F97316"],[data.totalYrs+"yr Sell",sym+Math.round(cvt(totSell/1000))+"K",T.green]].map(([l,v,c])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontSize:9,color:T.textSoft,marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div></div>
        ))}
      </div>

      {/* Per-shore cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:14}}>
        {LOCATIONS.map(loc=>{
          const sr=getSellRate(loc.key,data.rates,data.margins,data.fixedSell);
          return(
            <div key={loc.key} style={{border:`2px solid ${loc.color}30`,borderRadius:T.rMd,padding:11,background:loc.color+"06",borderTop:`3px solid ${loc.color}`}}>
              <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8}}><span style={{fontSize:15}}>{loc.flag}</span><div><div style={{fontSize:10,fontWeight:700,color:loc.color}}>{loc.label}</div><div style={{fontSize:8,color:T.textSoft}}>{loc.country}</div></div></div>
              <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Split %</div>
              <input type="range" min={0} max={100} value={data.ls[loc.key]} onChange={e=>patch({ls:updSplit(data,loc.key,Number(e.target.value))})} style={{width:"100%",accentColor:loc.color,marginBottom:2}}/>
              <div style={{textAlign:"center",fontSize:16,fontWeight:800,color:loc.color,marginBottom:7}}>{data.ls[loc.key]}%</div>
              <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Cost ({sym}/hr)</div>
              <NI pre={sym} val={Math.round(cvt(data.rates[loc.key]))} clr={loc.color}
                onChange={v=>patch({rates:{...data.rates,[loc.key]:v?Math.max(20,Math.round(v/(cvt(1)))):data.rates[loc.key]}})}/>
              <div style={{fontSize:8,color:T.textSoft,marginTop:5,marginBottom:2}}>Margin %</div>
              <input type="range" min={0} max={70} value={data.margins[loc.key]} onChange={e=>patch({margins:{...data.margins,[loc.key]:Number(e.target.value)},fixedSell:{...data.fixedSell,[loc.key]:null}})} style={{width:"100%",accentColor:"#10B981"}}/>
              <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:"#10B981",marginBottom:6}}>{data.margins[loc.key]}%</div>
              <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Fixed Sell Override</div>
              <NI pre={sym} val={data.fixedSell[loc.key]!=null?Math.round(cvt(data.fixedSell[loc.key])):null} ph="optional" clr="#8B5CF6"
                onChange={v=>patch({fixedSell:{...data.fixedSell,[loc.key]:v?Math.round(v/(cvt(1)||1)):null}})}/>
              <div style={{background:loc.color+"12",borderRadius:5,padding:"5px 7px",marginTop:7}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}><span style={{color:T.textSoft}}>FTEs</span><span style={{color:loc.color,fontWeight:700}}>{locFTEs[loc.key]}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}><span style={{color:T.textSoft}}>Sell</span><span style={{color:"#10B981",fontWeight:700}}>{sym}{Math.round(cvt(sr))}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}><span style={{color:T.textSoft}}>Margin</span><span style={{color:"#F97316",fontWeight:700}}>{sym}{Math.round(cvt(sr-data.rates[loc.key]))}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Year-by-year team structure */}
      <div style={{background:T.bg,borderRadius:T.rMd,padding:14}}>
        {sL("Team Size per Year (AI-adjusted, rounded to 0.5 FTE)")}
        <div style={{display:"grid",gridTemplateColumns:`repeat(${plan.length},1fr)`,gap:8}}>
          {plan.map(r=>(
            <div key={r.yr} style={{background:T.white,borderRadius:T.r,border:`1px solid ${T.border}`,padding:"9px 10px",textAlign:"center"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:4}}>Year {r.yr}</div>
              <div style={{fontSize:22,fontWeight:800,color:T.blue,fontFamily:font.display,marginBottom:4}}>{r.ftePerYear}</div>
              <div style={{fontSize:9,color:T.textSoft,marginBottom:6}}>FTEs · AI -{r.aiGainPct}%</div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {LOCATIONS.filter(l=>data.ls[l.key]>0&&r.locFTEsYear[l.key]>0).map(l=>(
                  <div key={l.key} style={{display:"flex",justifyContent:"space-between",fontSize:9}}>
                    <span style={{color:l.color}}>{l.flag} {l.label}</span>
                    <span style={{fontWeight:700,color:l.color}}>{r.locFTEsYear[l.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery centres */}
      <div style={{marginTop:14}}>
        {sL("NTT DATA Delivery Centres")}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
          {DELIVERY_CENTRES.map(d=>{const on=(data.dlocs||[]).includes(d.key);return(
            <button key={d.key} onClick={()=>patch({dlocs:on?(data.dlocs||[]).filter(x=>x!==d.key):[...(data.dlocs||[]),d.key]})}
              style={{padding:"6px 7px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11}}>{d.flag}</span><span style={{fontSize:8,fontWeight:700,color:on?T.blue:T.text}}>{d.label}</span></div>
              <div style={{fontSize:7,color:T.textSoft}}>{d.tz}</div>
              {on&&<div style={{fontSize:7,color:"#10B981",fontWeight:700}}>● Selected</div>}
            </button>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: AI Accelerators ───────────────────────────────────────────────────
function Step3({data,patch}){
  const [adding,setAdding]=useState(false);
  const [nA,setNA]=useState({name:"",timeline:"Y1 Q1",impact:"Medium",gainPct:5,desc:"",active:true});
  const accs=data.accelerators||DEFAULT_AI_ACCELERATORS;
  const {plan}=calcDerived(data);
  const iC={High:"#10B981",Medium:"#F59E0B",Transformational:"#8B5CF6",Low:T.textSoft};

  function upd(id,p){patch({accelerators:accs.map(a=>a.id===id?{...a,...p}:a)});}
  function rem(id){patch({accelerators:accs.filter(a=>a.id!==id)});}
  function add(){
    if(!nA.name)return;
    patch({accelerators:[...accs,{...nA,id:genId()}]});
    setAdding(false);
    setNA({name:"",timeline:"Y1 Q1",impact:"Medium",gainPct:5,desc:"",active:true});
  }

  const totalActiveGain=Math.min(accs.filter(a=>a.active).reduce((s,a)=>s+(a.gainPct||0),0),45);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>AI Accelerators & Efficiency Gains</div>
          <div style={{fontSize:12,color:T.textSoft,marginTop:2}}>Each accelerator reduces hours and team size. Gains compound with the base AI curve.</div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:T.textSoft}}>Total gain (max 45%)</div>
            <div style={{fontSize:22,fontWeight:800,color:"#10B981"}}>{totalActiveGain}%</div>
          </div>
          <Btn size="sm" variant="secondary" onClick={()=>setAdding(true)}>+ Add</Btn>
        </div>
      </div>

      {/* Year preview showing FTE reduction */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${plan.length},1fr)`,gap:7,marginBottom:16,padding:"10px 12px",background:"#F5F3FF",borderRadius:T.r,border:"1px solid #DDD6FE"}}>
        {plan.map(r=>(
          <div key={r.yr} style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"#6D28D9",marginBottom:2}}>Year {r.yr}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#6D28D9"}}>{r.ftePerYear} FTE</div>
            <div style={{fontSize:9,color:"#8B5CF6"}}>-{r.aiGainPct}% AI</div>
          </div>
        ))}
        <div style={{textAlign:"center",borderLeft:`1px solid #DDD6FE`,paddingLeft:8}}>
          <div style={{fontSize:9,color:"#6D28D9",marginBottom:2}}>Hours Saved</div>
          <div style={{fontSize:14,fontWeight:800,color:"#6D28D9"}}>{plan.reduce((s,r)=>s+(r.noAiHrs-r.totalH),0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {accs.map(a=>{const col=iC[a.impact]||T.blue;return(
          <div key={a.id} style={{border:`1px solid ${T.border}`,borderRadius:T.rMd,padding:"11px 13px",borderLeft:`4px solid ${a.active?col:T.border}`,opacity:a.active?1:0.5,background:T.white}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              {/* Toggle */}
              <button onClick={()=>upd(a.id,{active:!a.active})} style={{width:34,height:18,borderRadius:100,border:"none",cursor:"pointer",background:a.active?T.blue:T.border,position:"relative",flexShrink:0,marginTop:3,transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:2,left:a.active?16:2,width:14,height:14,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
              </button>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                  <input value={a.name} onChange={e=>upd(a.id,{name:e.target.value})} style={{fontSize:12,fontWeight:700,color:T.text,border:"none",outline:"none",background:"transparent",flex:1,minWidth:100}}/>
                  <select value={a.timeline} onChange={e=>upd(a.id,{timeline:e.target.value})} style={{fontSize:10,border:`1px solid ${T.border}`,borderRadius:4,padding:"1px 5px",background:T.white}}>
                    {TIMELINE_OPTS.map(t=>(<option key={t}>{t}</option>))}
                  </select>
                  <select value={a.impact} onChange={e=>upd(a.id,{impact:e.target.value})} style={{fontSize:10,border:`1px solid ${T.border}`,borderRadius:4,padding:"1px 5px",color:col,background:T.white,fontWeight:600}}>
                    {IMPACT_OPTS.map(t=>(<option key={t}>{t}</option>))}
                  </select>
                  <div style={{display:"flex",alignItems:"center",gap:3,background:"#D1FAE5",borderRadius:4,padding:"1px 6px"}}>
                    <span style={{fontSize:9,color:"#065F46"}}>Gain:</span>
                    <input type="number" min={0} max={20} value={a.gainPct||0} onChange={e=>upd(a.id,{gainPct:Math.max(0,Math.min(20,Number(e.target.value)))})} style={{width:32,fontSize:11,fontWeight:800,color:"#10B981",border:"none",outline:"none",background:"transparent",textAlign:"center"}}/>
                    <span style={{fontSize:9,color:"#10B981",fontWeight:700}}>%</span>
                  </div>
                  {a.id.startsWith("acc_")&&<button onClick={()=>rem(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSoft,fontSize:14}}>×</button>}
                </div>
                <input value={a.desc||""} onChange={e=>upd(a.id,{desc:e.target.value})} style={{width:"100%",fontSize:10,color:T.textMid,border:"none",outline:"none",background:"transparent"}} placeholder="Description..."/>
                {a.benefit&&<div style={{fontSize:9,color:"#10B981",marginTop:2}}>✓ {a.benefit}</div>}
              </div>
            </div>
          </div>
        );})}
      </div>

      {adding&&(
        <div style={{border:`2px dashed ${T.blue}`,borderRadius:T.rMd,padding:14,background:T.blueSoft}}>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:10}}>New Accelerator</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:7,marginBottom:7}}>
            <input value={nA.name} onChange={e=>setNA(a=>({...a,name:e.target.value}))} placeholder="Name" style={IS(false)}/>
            <select value={nA.timeline} onChange={e=>setNA(a=>({...a,timeline:e.target.value}))} style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:10,background:T.white}}>
              {TIMELINE_OPTS.map(t=>(<option key={t}>{t}</option>))}
            </select>
            <select value={nA.impact} onChange={e=>setNA(a=>({...a,impact:e.target.value}))} style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:10,background:T.white}}>
              {IMPACT_OPTS.map(t=>(<option key={t}>{t}</option>))}
            </select>
            <div style={{display:"flex",alignItems:"center",gap:3,padding:"0 8px",border:`1px solid ${T.border}`,borderRadius:T.r,background:T.white}}>
              <input type="number" min={0} max={20} value={nA.gainPct} onChange={e=>setNA(a=>({...a,gainPct:Number(e.target.value)}))} style={{width:28,border:"none",outline:"none",fontSize:11,fontWeight:700,color:"#10B981"}}/>
              <span style={{fontSize:9,color:"#10B981"}}>%</span>
            </div>
          </div>
          <input value={nA.desc} onChange={e=>setNA(a=>({...a,desc:e.target.value}))} placeholder="Description..." style={{...IS(false),marginBottom:8}}/>
          <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
            <Btn variant="ghost" size="sm" onClick={()=>setAdding(false)}>Cancel</Btn>
            <Btn size="sm" onClick={add} disabled={!nA.name}>Add</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 4: Phases ────────────────────────────────────────────────────────────
function Step4({data,patch,sym,cvt}){
  const {plan,baseFTE}=calcDerived(data);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
      <div>
        {sL("Phase Configuration")}
        <Slider label="KT Duration"       min={2} max={12} value={data.ktMo}  onChange={v=>patch({ktMo:v})}  unit=" months"/>
        <Slider label="Calibration Period" min={1} max={6}  value={data.calMo} onChange={v=>patch({calMo:v})} unit=" months"/>
        <Slider label="Contingency %"      min={0} max={30} value={data.cont}  onChange={v=>patch({cont:v})}  unit="%"/>
        <div style={{marginTop:8,padding:"10px 12px",background:"#D1FAE5",borderRadius:T.r,fontSize:11,color:"#10B981",fontWeight:600}}>
          SLA credits/penalties live from Month {data.ktMo+data.calMo+1}
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          {[[sym+Math.round(cvt(totSell/1000))+"K","Total Sell","#10B981"],[sym+Math.round(cvt(totCost/1000))+"K","Total Cost",T.blueDark],[baseFTE+" FTE","Baseline Team",T.blue]].map(([v,l,c])=>(
            <div key={l} style={{flex:1,background:T.bg,borderRadius:T.r,padding:"9px 11px",borderLeft:`3px solid ${c}`}}>
              <div style={{fontSize:9,color:T.textSoft}}>{l}</div>
              <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        {sL("Year-by-Year Preview")}
        {plan.map(r=>(
          <div key={r.yr} style={{marginBottom:7,padding:"9px 11px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>Year {r.yr}</span>
              <div style={{display:"flex",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:T.teal}}>{r.ftePerYear} FTE</span>
                <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{sym}{Math.round(cvt(r.sellWC/1000))}K</span>
              </div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:4,flexWrap:"wrap"}}>
              {r.ktH>0&&<span style={{fontSize:9,background:"#FEF3C7",color:"#D97706",borderRadius:3,padding:"1px 5px",fontWeight:600}}>KT</span>}
              {r.calH>0&&<span style={{fontSize:9,background:"#CCFBF1",color:"#0D9488",borderRadius:3,padding:"1px 5px",fontWeight:600}}>Cal</span>}
              {r.ssH>0&&<span style={{fontSize:9,background:"#D1FAE5",color:"#059669",borderRadius:3,padding:"1px 5px",fontWeight:600}}>SS -{r.aiGainPct}% AI</span>}
            </div>
            <div style={{height:4,background:T.border,borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",width:(r.sellWC/plan.reduce((s,x)=>Math.max(s,x.sellWC),1)*100)+"%",background:T.blue,borderRadius:100}}/>
            </div>
            <div style={{fontSize:9,color:T.textSoft,marginTop:2}}>{r.totalH.toLocaleString()} hrs</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 5: Review & Submit ───────────────────────────────────────────────────
function Step5({data,sym,cvt}){
  const {base,intgHrs,blendC,blendS,plan,baseFTE,locFTEs}=calcDerived(data);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const totMargin=totSell-totCost;
  const blendMP=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  const roleData=ROLES.map(r=>{const h=base.totalL2*r.l2w+base.totalL3*r.l3w+base.totalEnh*r.enhw+intgHrs*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);return{...r,fte:roundFTE(h/FTE_HRS)};}).filter(r=>r.fte>0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[[sym+Math.round(cvt(totSell/1000))+"K","Total Sell","#10B981"],[sym+Math.round(cvt(totCost/1000))+"K","Total Cost",T.blueDark],[sym+Math.round(cvt(totMargin/1000))+"K","Gross Margin","#F97316"],[blendMP+"%","Blended Margin",T.blue]].map(([v,l,c])=>(
          <div key={l} style={{background:T.bg,borderRadius:T.r,padding:"11px 13px",borderLeft:`3px solid ${c}`}}>
            <div style={{fontSize:9,color:T.textSoft,marginBottom:1}}>{l}</div>
            <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Team by year */}
      <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
        <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>Team Size by Year — FTEs reduce as AI matures (rounded to 0.5)</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${plan.length},1fr)`,gap:8}}>
          {plan.map((r,i)=>{
            const prev=i===0?null:plan[i-1].ftePerYear;
            const delta=prev===null?null:r.ftePerYear-prev;
            return(
              <div key={r.yr} style={{background:T.white,borderRadius:T.r,border:`1px solid ${T.border}`,padding:"9px 10px",textAlign:"center"}}>
                <div style={{fontSize:10,color:T.textSoft,marginBottom:2}}>Year {r.yr}</div>
                <div style={{fontSize:24,fontWeight:800,color:T.blue,fontFamily:font.display}}>{r.ftePerYear}</div>
                <div style={{fontSize:9,color:"#8B5CF6"}}>-{r.aiGainPct}% AI</div>
                {delta!==null&&<div style={{fontSize:10,fontWeight:700,color:delta<0?"#10B981":"#F59E0B"}}>{delta<0?delta:"+"+delta} FTE</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Org & Roles */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
          <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>Organisation (baseline)</div>
          {roleData.map(r=>(
            <div key={r.key} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",gap:2,flexShrink:0}}>
                {[["L2",r.l2],["L3",r.l3],["E",r.enh],["KT",r.kt]].map(([k,v])=>(<span key={k} style={{background:RACI_C[v]+"18",color:RACI_C[v],borderRadius:3,padding:"0 3px",fontSize:7,fontWeight:700}}>{k}:{v}</span>))}
              </div>
              <span style={{fontSize:10,color:T.text,flex:1}}>{r.label}</span>
              <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{r.fte}</span>
            </div>
          ))}
          <div style={{marginTop:8,paddingTop:6,borderTop:`2px solid ${T.blue}`}}>
            {LOCATIONS.filter(l=>locFTEs[l.key]>0).map(l=>(<div key={l.key} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontSize:11}}>{l.flag}</span><span style={{fontSize:10,color:T.textMid,flex:1}}>{l.label}</span><span style={{fontSize:11,fontWeight:700,color:l.color}}>{locFTEs[l.key]} FTE</span></div>))}
          </div>
        </div>
        <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
          <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>KT Plan — {data.ktMo} months</div>
          {[{t:"Discovery & Shadow",c:"#F59E0B",mo:1},{t:"Runbook Creation",c:"#14B8A6",mo:2},{t:"Primary Ownership",c:"#10B981",mo:3}].slice(0,Math.min(data.ktMo,3)).map(s=>(
            <div key={s.t} style={{borderLeft:`3px solid ${s.c}`,paddingLeft:8,marginBottom:8}}>
              <div style={{fontSize:9,fontWeight:700,color:s.c}}>Month {s.mo}</div>
              <div style={{fontSize:11,color:T.text,fontWeight:600}}>{s.t}</div>
            </div>
          ))}
          <div style={{marginTop:8,padding:"7px 10px",background:"#D1FAE5",borderRadius:T.r,fontSize:10,color:"#10B981",fontWeight:600}}>Calibration: Months {data.ktMo+1}–{data.ktMo+data.calMo} · SLA live Month {data.ktMo+data.calMo+1}</div>
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:6}}>Top Risks</div>
            {RISKS.slice(0,3).map(r=>(
              <div key={r.id} style={{display:"flex",gap:8,padding:"5px 7px",background:T.white,borderRadius:T.r,border:`1px solid ${T.border}`,borderLeft:`3px solid ${RISK_C[r.impact]||T.border}`,marginBottom:4}}>
                <div style={{display:"flex",gap:3,flexShrink:0,marginTop:1}}>
                  <span style={{fontSize:7,background:RISK_C[r.likelihood]+"18",color:RISK_C[r.likelihood],borderRadius:3,padding:"0 3px",fontWeight:600}}>L:{r.likelihood[0]}</span>
                  <span style={{fontSize:7,background:RISK_C[r.impact]+"18",color:RISK_C[r.impact],borderRadius:3,padding:"0 3px",fontWeight:600}}>I:{r.impact[0]}</span>
                </div>
                <span style={{fontSize:10,color:T.text}}>{r.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function OppWizard({opp,onClose,onSave,onSubmit,sym,fxRate,currency}){
  const [step,setStep]      = useState(1);
  const [data,setData]      = useState({...opp,accelerators:opp.accelerators||[...DEFAULT_AI_ACCELERATORS]});
  const [completed,setCompleted] = useState(opp.wizardComplete?5:0);
  const [saving,setSaving]  = useState(false);

  const cvt = v => currency==="GBP"?(fxRate?v*fxRate:v*0.79):v;
  const curVer = data.version||"Draft";
  const curVerIdx = VERSION_LABELS.indexOf(curVer);
  const nextVer = VERSION_LABELS[Math.min(curVerIdx+1,VERSION_LABELS.length-1)];

  function patch(p){ setData(d=>({...d,...p})); }

  function handleNext(){
    setCompleted(c=>Math.max(c,step));
    setStep(s=>Math.min(s+1,5));
  }
  function handleBack(){ setStep(s=>Math.max(s-1,1)); }

  async function handleSaveDraft(){
    setSaving(true);
    await onSave({...data,wizardStep:step,updatedAt:new Date().toISOString()});
    setSaving(false);
    onClose();
  }

  async function handleSubmit(){
    setSaving(true);
    const updated={...data,wizardStep:5,wizardComplete:true,updatedAt:new Date().toISOString()};
    await onSubmit(updated);
    setSaving(false);
    // onClose called by parent after navigating to dashboard
  }

  function promoteVersion(){
    if(curVer==="Final") return;
    patch({version:nextVer});
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,62,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,boxShadow:"0 24px 80px rgba(13,27,62,0.22)",width:"100%",maxWidth:980,maxHeight:"94vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div>
            <input value={data.name||""} onChange={e=>patch({name:e.target.value})}
              style={{fontSize:15,fontWeight:800,color:T.text,border:"none",outline:"none",background:"transparent",fontFamily:font.display}}
              placeholder="Engagement name..."/>
            <div style={{fontSize:11,color:T.textSoft}}>{data.client||"No client"}{data.clientCity?" · "+data.clientCity:""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* Version chip */}
            <div style={{padding:"3px 10px",borderRadius:100,background:VERSION_BG[curVer],color:VERSION_COLORS[curVer],fontSize:10,fontWeight:700}}>
              {curVer}
            </div>
            {/* Promote button — always visible */}
            {curVer!=="Final"&&(
              <button onClick={promoteVersion}
                style={{padding:"4px 12px",borderRadius:6,border:`1.5px solid ${VERSION_COLORS[nextVer]}`,background:VERSION_BG[nextVer],color:VERSION_COLORS[nextVer],fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:font.body}}>
                ↑ Promote to {nextVer}
              </button>
            )}
            {fxRate&&<span style={{fontSize:9,color:T.textSoft}}>1 USD = {fxRate.toFixed(4)} GBP</span>}
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.textSoft,padding:"2px 6px",lineHeight:1}}>×</button>
          </div>
        </div>

        {/* Step bar */}
        <div style={{display:"flex",alignItems:"center",padding:"12px 22px",background:T.bg,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          {STEPS.map((s,i)=>{
            const done=completed>=s.n; const active=step===s.n;
            return(
              <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"unset"}}>
                <button onClick={()=>done&&setStep(s.n)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:done?"pointer":"default",padding:"0 4px"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:active?T.blue:done?T.green:T.border,color:active||done?"white":T.textSoft,border:active?`2px solid ${T.blueDark}`:"2px solid transparent",transition:"all 0.2s",flexShrink:0}}>
                    {done&&!active?"✓":s.n}
                  </div>
                  <div style={{fontSize:10,fontWeight:active?700:500,color:active?T.blue:done?T.green:T.textSoft,whiteSpace:"nowrap"}}>{s.icon} {s.label}</div>
                </button>
                {i<STEPS.length-1&&<div style={{flex:1,height:2,background:done?T.green:T.border,margin:"0 4px",marginBottom:14,transition:"background 0.3s"}}/>}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {step===1&&<Step1 data={data} patch={patch}/>}
          {step===2&&<Step2 data={data} patch={patch} sym={sym} cvt={cvt}/>}
          {step===3&&<Step3 data={data} patch={patch}/>}
          {step===4&&<Step4 data={data} patch={patch} sym={sym} cvt={cvt}/>}
          {step===5&&<Step5 data={data} sym={sym} cvt={cvt}/>}
        </div>

        {/* Footer */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderTop:`1px solid ${T.border}`,background:T.bg,flexShrink:0}}>
          <div style={{display:"flex",gap:7}}>
            {step>1&&<Btn variant="secondary" onClick={handleBack}>← Back</Btn>}
            <Btn variant="ghost" onClick={handleSaveDraft} disabled={saving}>{saving?"Saving...":"Save Draft"}</Btn>
          </div>

          {/* Version + promote in footer too */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:T.textSoft}}>Step {step} of 5</span>
            <span style={{padding:"2px 8px",borderRadius:100,background:VERSION_BG[curVer],color:VERSION_COLORS[curVer],fontSize:10,fontWeight:700}}>{curVer}</span>
            {curVer!=="Final"&&(
              <button onClick={promoteVersion}
                style={{padding:"3px 10px",borderRadius:5,border:`1px solid ${VERSION_COLORS[nextVer]}`,background:"white",color:VERSION_COLORS[nextVer],fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:font.body}}>
                ↑ {nextVer}
              </button>
            )}
          </div>

          <div style={{display:"flex",gap:7}}>
            {step<5?(
              <Btn onClick={handleNext}>Save & Next →</Btn>
            ):(
              <Btn onClick={handleSubmit} disabled={saving}>{saving?"Submitting...":"Submit → Dashboard"}</Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
