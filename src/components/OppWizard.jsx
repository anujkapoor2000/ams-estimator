// src/components/OppWizard.jsx
import { useState } from "react";
import { T, font } from "../design.js";
import { Btn } from "./ui.jsx";
import {
  MODULES, INTEGRATIONS, COVERAGE_OPTIONS, LOCATIONS, DELIVERY_CENTRES,
  ROLES, RISKS, DEFAULT_AI_ACCELERATORS, buildPlan, buildAIGainCurve,
  calcBase, blendedCostRate, blendedSellRate, getSellRate, splitFTE,
  versionColor, FTE_HRS, KT_OVERHEAD,
} from "../store/appData.js";

const STEPS=[{n:1,label:"Scope",icon:"📋"},{n:2,label:"Rates & Team",icon:"👥"},{n:3,label:"AI Accelerators",icon:"⚡"},{n:4,label:"Phases",icon:"📅"},{n:5,label:"Review",icon:"✅"}];
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
const sH={fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10};

function StepBar({current,completed}){
  return(
    <div style={{display:"flex",alignItems:"center",padding:"16px 28px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
      {STEPS.map((s,i)=>{
        const done=completed>=s.n;const active=current===s.n;
        return(<div key={s.n} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"unset"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:done||active?T.blue:T.border,color:done||active?"white":T.textSoft,border:active?`2px solid ${T.blueDark}`:"2px solid transparent",transition:"all 0.2s",flexShrink:0}}>{done&&!active?"✓":s.icon}</div>
            <div><div style={{fontSize:11,fontWeight:active?700:500,color:active?T.blue:done?T.text:T.textSoft}}>{s.label}</div><div style={{fontSize:9,color:T.textSoft}}>Step {s.n}</div></div>
          </div>
          {i<STEPS.length-1&&<div style={{flex:1,height:2,background:done?T.blue:T.border,margin:"0 10px",transition:"background 0.3s"}}/>}
        </div>);
      })}
    </div>
  );
}

function Sl({label,min,max,v,set,u,hint,step=1}){
  return(<div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.textMid}}>{label}{hint&&<span style={{fontSize:9,color:T.textSoft,marginLeft:5}}>{hint}</span>}</span><span style={{fontSize:12,fontWeight:700,color:T.blue}}>{v}{u}</span></div>
    <input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(Number(e.target.value))} style={{width:"100%",accentColor:T.blue}}/>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.textSoft,marginTop:1}}><span>{min}{u}</span><span>{max}{u}</span></div>
  </div>);
}

function Step1({data,onChange}){
  return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
    <div>
      <div style={sH}>GW Modules</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {MODULES.map(m=>{const on=data.mods.includes(m);return(<button key={m} onClick={()=>onChange({mods:on?data.mods.filter(x=>x!==m):[...data.mods,m]})} style={{padding:"10px 12px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}><div style={{fontSize:11,fontWeight:700,color:on?T.blue:T.text}}>{m}</div><div style={{fontSize:9,color:T.textSoft,marginTop:1}}>{m.includes("Jutro")?"Digital layer":"Core insurance"}</div></button>);})}
      </div>
      <div style={sH}>Cloud Integrations</div>
      {INTEGRATIONS.map(i=>{const on=data.intgs.includes(i);return(<label key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:T.r,background:on?T.blueSoft:T.bg,border:`1px solid ${on?T.blueMid:T.border}`,cursor:"pointer",marginBottom:5,transition:"all 0.15s"}}><input type="checkbox" checked={on} onChange={()=>onChange({intgs:on?data.intgs.filter(x=>x!==i):[...data.intgs,i]})} style={{accentColor:T.blue,width:13,height:13}}/><span style={{fontSize:11,fontWeight:on?600:400,color:on?T.blue:T.text}}>{i}</span></label>);})}
    </div>
    <div>
      <div style={sH}>Engagement Configuration</div>
      <Sl label="Engagement Years" min={1} max={7} v={data.totalYrs} set={v=>onChange({totalYrs:v})} u=" yrs"/>
      <Sl label="Tickets / Month" min={10} max={300} step={5} v={data.tkt} set={v=>onChange({tkt:v})} u="" hint="All modules combined"/>
      <Sl label="Story Points / Sprint" min={10} max={50} v={data.spS} set={v=>onChange({spS:v})} u=" SP"/>
      <Sl label="Sprints / Year" min={12} max={26} v={data.spY} set={v=>onChange({spY:v})} u=""/>
      <Sl label="Avg L2 Resolution" min={1} max={16} v={data.avgL2} set={v=>onChange({avgL2:v})} u=" hrs" hint="Break-fix"/>
      <Sl label="Avg L3 Resolution" min={4} max={40} v={data.avgL3} set={v=>onChange({avgL3:v})} u=" hrs" hint="Gosu/deep fix"/>
      <div style={{marginTop:14}}>
        <div style={sH}>Service Coverage Model</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {COVERAGE_OPTIONS.map(o=>{const on=data.covKey===o.key;return(<button key={o.key} onClick={()=>onChange({covKey:o.key})} style={{padding:"9px 10px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}><div style={{fontSize:10,fontWeight:700,color:on?T.blue:T.text}}>{o.label}</div><div style={{fontSize:8,color:T.textSoft}}>{o.desc}</div><div style={{fontSize:9,fontWeight:600,color:on?T.blue:T.textSoft,marginTop:2}}>{o.annualHrs.toLocaleString()} hrs/yr</div></button>);})}
        </div>
      </div>
    </div>
  </div>);
}

function Step2({data,onChange,sym,fxRate,currency}){
  const cvt=v=>currency==="GBP"?Math.round(v*(fxRate||0.79)):v;
  const base=calcBase(data.mods,data.spS,data.spY,data.avgL2,data.avgL3,data.tkt);
  const intgHrs=(data.intgs||[]).length*60;
  const annBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=Math.round(annBase/FTE_HRS*10)/10;
  const locFTEs=splitFTE(totalFTE,data.ls);
  const blendC=blendedCostRate(data.ls,data.rates);
  const blendS=blendedSellRate(data.ls,data.rates,data.margins,data.fixedSell);
  const blendMP=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  function updSplit(key,val){const oth=LOCATIONS.filter(l=>l.key!==key);const rem=100-val;const c2=oth.reduce((s,l)=>s+data.ls[l.key],0);const ns={...data.ls,[key]:val};if(c2>0){oth.forEach(l=>{ns[l.key]=Math.round((data.ls[l.key]/c2)*rem);});}else{const eq=Math.floor(rem/oth.length);oth.forEach((l,i)=>{ns[l.key]=i===oth.length-1?rem-eq*(oth.length-1):eq;});}onChange({ls:ns});}
  return(<div>
    <div style={{display:"flex",gap:12,marginBottom:18,padding:"12px 16px",background:T.blueSoft,borderRadius:T.rMd,flexWrap:"wrap"}}>
      {[["Total FTEs",totalFTE,T.blue],["Blended Cost/hr",sym+Math.round(cvt(blendC)),T.blueDark],["Blended Sell/hr",sym+Math.round(cvt(blendS)),T.green],["Margin",blendMP+"%","#F97316"]].map(([l,v,c])=>(<div key={l} style={{textAlign:"center",flex:1}}><div style={{fontSize:9,color:T.textSoft,marginBottom:2}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
      {LOCATIONS.map(loc=>{const sr=getSellRate(loc.key,data.rates,data.margins,data.fixedSell);const ma=Math.round(sr-data.rates[loc.key]);return(<div key={loc.key} style={{border:`2px solid ${loc.color}30`,borderRadius:T.rMd,padding:11,background:loc.color+"06",borderTop:`3px solid ${loc.color}`}}>
        <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8}}><span style={{fontSize:15}}>{loc.flag}</span><div><div style={{fontSize:10,fontWeight:700,color:loc.color}}>{loc.label}</div><div style={{fontSize:8,color:T.textSoft}}>{loc.country}</div></div></div>
        <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Split</div>
        <input type="range" min={0} max={100} value={data.ls[loc.key]} onChange={e=>updSplit(loc.key,Number(e.target.value))} style={{width:"100%",accentColor:loc.color,marginBottom:2}}/>
        <div style={{textAlign:"center",fontSize:16,fontWeight:800,color:loc.color,marginBottom:7}}>{data.ls[loc.key]}%</div>
        <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Cost ({sym}/hr)</div>
        <div style={{display:"flex",gap:2,alignItems:"center",marginBottom:6}}><span style={{fontSize:9,color:T.textSoft}}>{sym}</span><input type="number" min={20} max={400} value={Math.round(cvt(data.rates[loc.key]))} onChange={e=>{const raw=currency==="GBP"?Math.round(Number(e.target.value)/(fxRate||0.79)):Number(e.target.value);onChange({rates:{...data.rates,[loc.key]:Math.max(20,raw)}});}} style={{width:"100%",padding:"3px 5px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:11,fontWeight:700,color:loc.color,outline:"none"}}/></div>
        <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Margin %</div>
        <input type="range" min={0} max={70} value={data.margins[loc.key]} onChange={e=>{onChange({margins:{...data.margins,[loc.key]:Number(e.target.value)},fixedSell:{...data.fixedSell,[loc.key]:null}});}} style={{width:"100%",accentColor:"#10B981",marginBottom:2}}/>
        <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:"#10B981",marginBottom:6}}>{data.margins[loc.key]}%</div>
        <div style={{fontSize:8,color:T.textSoft,marginBottom:2}}>Fixed Sell Override</div>
        <div style={{display:"flex",gap:2,alignItems:"center",marginBottom:8}}><span style={{fontSize:9,color:T.textSoft}}>{sym}</span><input type="number" min={0} max={600} value={data.fixedSell[loc.key]!=null?Math.round(cvt(data.fixedSell[loc.key])):""} placeholder="opt" onChange={e=>onChange({fixedSell:{...data.fixedSell,[loc.key]:e.target.value?Math.round(Number(e.target.value)/(currency==="GBP"?fxRate||0.79:1)):null}})} style={{width:"100%",padding:"3px 5px",border:`1px solid ${data.fixedSell[loc.key]?"#8B5CF6":T.border}`,borderRadius:T.r,fontSize:10,color:data.fixedSell[loc.key]?"#8B5CF6":T.textSoft,outline:"none"}}/></div>
        <div style={{background:loc.color+"12",borderRadius:5,padding:"5px 7px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.textSoft,marginBottom:1}}><span>FTEs</span><span style={{color:loc.color,fontWeight:700}}>{locFTEs[loc.key]}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.textSoft,marginBottom:1}}><span>Sell</span><span style={{color:"#10B981",fontWeight:700}}>{sym}{Math.round(cvt(sr))}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.textSoft}}><span>Margin</span><span style={{color:"#F97316",fontWeight:700}}>{sym}{Math.round(cvt(ma))}</span></div>
        </div>
      </div>);})}
    </div>
    <div style={sH}>Delivery Centres</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
      {DELIVERY_CENTRES.map(d=>{const on=(data.dlocs||[]).includes(d.key);return(<button key={d.key} onClick={()=>onChange({dlocs:on?(data.dlocs||[]).filter(x=>x!==d.key):[...(data.dlocs||[]),d.key]})} style={{padding:"6px 7px",borderRadius:T.r,border:`2px solid ${on?T.blue:T.border}`,background:on?T.blueSoft:T.white,cursor:"pointer",textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11}}>{d.flag}</span><span style={{fontSize:8,fontWeight:700,color:on?T.blue:T.text}}>{d.label}</span></div><div style={{fontSize:7,color:T.textSoft}}>{d.tz}</div>{on&&<div style={{fontSize:7,color:"#10B981",fontWeight:700}}>● Selected</div>}</button>);})}
    </div>
  </div>);
}

function Step3({data,onChange}){
  const [adding,setAdding]=useState(false);
  const [nA,setNA]=useState({name:"",timeline:"Y1 Q1",impact:"Medium",gainPct:5,desc:"",active:true});
  const accs=data.accelerators||DEFAULT_AI_ACCELERATORS;
  const iC={High:"#10B981",Medium:"#F59E0B",Transformational:"#8B5CF6",Low:T.textSoft};
  function upd(id,p){onChange({accelerators:accs.map(a=>a.id===id?{...a,...p}:a)});}
  function rem(id){onChange({accelerators:accs.filter(a=>a.id!==id)});}
  function add(){if(!nA.name)return;onChange({accelerators:[...accs,{...nA,id:"c_"+genId()}]});setAdding(false);setNA({name:"",timeline:"Y1 Q1",impact:"Medium",gainPct:5,desc:"",active:true});}
  const total=Math.min(accs.filter(a=>a.active).reduce((s,a)=>s+(a.gainPct||0),0),45);
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div><div style={{fontSize:14,fontWeight:700,color:T.text}}>AI Accelerators</div><div style={{fontSize:12,color:T.textSoft}}>Configure accelerators and their efficiency gains</div></div>
      <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{textAlign:"right"}}><div style={{fontSize:9,color:T.textSoft}}>Total gain (cap 45%)</div><div style={{fontSize:20,fontWeight:800,color:"#10B981"}}>{total}%</div></div><Btn size="sm" variant="secondary" onClick={()=>setAdding(true)}>+ Add</Btn></div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
      {accs.map(a=>{const col=iC[a.impact]||T.blue;return(<div key={a.id} style={{border:`1px solid ${T.border}`,borderRadius:T.rMd,padding:"12px 14px",borderLeft:`4px solid ${a.active?col:T.border}`,opacity:a.active?1:0.5,background:T.white}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
          <button onClick={()=>upd(a.id,{active:!a.active})} style={{width:34,height:18,borderRadius:100,border:"none",cursor:"pointer",background:a.active?T.blue:T.border,position:"relative",flexShrink:0,marginTop:3,transition:"background 0.2s"}}><div style={{position:"absolute",top:2,left:a.active?16:2,width:14,height:14,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/></button>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
              <input value={a.name} onChange={e=>upd(a.id,{name:e.target.value})} style={{fontSize:12,fontWeight:700,color:T.text,border:"none",outline:"none",background:"transparent",flex:1,minWidth:100}}/>
              <select value={a.timeline} onChange={e=>upd(a.id,{timeline:e.target.value})} style={{fontSize:10,border:`1px solid ${T.border}`,borderRadius:4,padding:"1px 5px",background:T.white}}>
                {["Y1 Q1","Y1 Q2","Y1 Q3","Y1 Q4","Y2 Q1","Y2 Q2","Y3 Q1"].map(t=>(<option key={t}>{t}</option>))}
              </select>
              <select value={a.impact} onChange={e=>upd(a.id,{impact:e.target.value})} style={{fontSize:10,border:`1px solid ${T.border}`,borderRadius:4,padding:"1px 5px",color:col,background:T.white,fontWeight:600}}>
                {["Low","Medium","High","Transformational"].map(t=>(<option key={t}>{t}</option>))}
              </select>
              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:9,color:T.textSoft}}>Gain:</span><input type="number" min={0} max={20} value={a.gainPct} onChange={e=>upd(a.id,{gainPct:Math.max(0,Math.min(20,Number(e.target.value)))})} style={{width:38,fontSize:11,fontWeight:700,color:"#10B981",border:`1px solid ${T.border}`,borderRadius:3,padding:"1px 3px",textAlign:"center",outline:"none"}}/><span style={{fontSize:9,color:"#10B981",fontWeight:600}}>%</span></div>
              {a.id.startsWith("c_")&&<button onClick={()=>rem(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSoft,fontSize:14}}>×</button>}
            </div>
            <input value={a.desc} onChange={e=>upd(a.id,{desc:e.target.value})} style={{width:"100%",fontSize:10,color:T.textMid,border:"none",outline:"none",background:"transparent"}} placeholder="Description..."/>
          </div>
        </div>
      </div>);})}
    </div>
    {adding&&(<div style={{border:`2px dashed ${T.blue}`,borderRadius:T.rMd,padding:14,background:T.blueSoft}}>
      <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:10}}>New Accelerator</div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:7,marginBottom:7}}>
        <input value={nA.name} onChange={e=>setNA(a=>({...a,name:e.target.value}))} placeholder="Name" style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:11,outline:"none"}}/>
        <select value={nA.timeline} onChange={e=>setNA(a=>({...a,timeline:e.target.value}))} style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:10,background:T.white}}>{["Y1 Q1","Y1 Q2","Y1 Q3","Y1 Q4","Y2 Q1","Y2 Q2","Y3 Q1"].map(t=>(<option key={t}>{t}</option>))}</select>
        <select value={nA.impact} onChange={e=>setNA(a=>({...a,impact:e.target.value}))} style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:10,background:T.white}}>{["Low","Medium","High","Transformational"].map(t=>(<option key={t}>{t}</option>))}</select>
        <div style={{display:"flex",alignItems:"center",gap:3,padding:"0 8px",border:`1px solid ${T.border}`,borderRadius:T.r,background:T.white}}><input type="number" min={0} max={20} value={nA.gainPct} onChange={e=>setNA(a=>({...a,gainPct:Number(e.target.value)}))} style={{width:28,border:"none",outline:"none",fontSize:11,fontWeight:700,color:"#10B981"}}/><span style={{fontSize:9,color:"#10B981"}}>%</span></div>
      </div>
      <input value={nA.desc} onChange={e=>setNA(a=>({...a,desc:e.target.value}))} placeholder="Description..." style={{width:"100%",padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:10,outline:"none",marginBottom:8}}/>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><Btn variant="ghost" size="sm" onClick={()=>setAdding(false)}>Cancel</Btn><Btn size="sm" onClick={add} disabled={!nA.name}>Add</Btn></div>
    </div>)}
  </div>);
}

function Step4({data,onChange,sym,fxRate,currency}){
  const cvt=v=>currency==="GBP"?Math.round(v*(fxRate||0.79)):v;
  const base=calcBase(data.mods,data.spS,data.spY,data.avgL2,data.avgL3,data.tkt);
  const intgHrs=(data.intgs||[]).length*60;
  const blendC=blendedCostRate(data.ls,data.rates);
  const blendS=blendedSellRate(data.ls,data.rates,data.margins,data.fixedSell);
  const aiCurve=buildAIGainCurve(data.accelerators,data.totalYrs);
  const plan=buildPlan(base,intgHrs,data.ktMo,data.calMo,data.totalYrs,blendC,blendS,data.cont,aiCurve);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
    <div>
      <div style={sH}>Phase Configuration</div>
      <Sl label="KT Duration" min={2} max={12} v={data.ktMo} set={v=>onChange({ktMo:v})} u=" months" hint="KT window"/>
      <Sl label="Calibration Period" min={1} max={6} v={data.calMo} set={v=>onChange({calMo:v})} u=" months" hint="No SLA penalties"/>
      <Sl label="Contingency %" min={0} max={30} v={data.cont} set={v=>onChange({cont:v})} u="%"/>
      <div style={{marginTop:12,padding:"10px 12px",background:"#D1FAE5",borderRadius:T.r,fontSize:11,color:"#10B981",fontWeight:600}}>SLA live from Month {data.ktMo+data.calMo+1}</div>
      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
        {[[sym+Math.round(cvt(totSell/1000))+"K","Total Sell","#10B981"],[sym+Math.round(cvt(totCost/1000))+"K","Total Cost",T.blueDark],[data.totalYrs+"yr","Duration",T.blue]].map(([v,l,c])=>(<div key={l} style={{flex:1,background:T.bg,borderRadius:T.r,padding:"9px 11px",borderLeft:`3px solid ${c}`}}><div style={{fontSize:9,color:T.textSoft}}>{l}</div><div style={{fontSize:16,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div></div>))}
      </div>
    </div>
    <div>
      <div style={sH}>Year-by-Year Preview</div>
      {plan.map(r=>(<div key={r.yr} style={{marginBottom:7,padding:"9px 11px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:T.text}}>Year {r.yr}</span><span style={{fontSize:12,fontWeight:700,color:T.blue}}>{sym}{Math.round(cvt(r.sellWC/1000))}K</span></div>
        <div style={{display:"flex",gap:4,marginBottom:4,flexWrap:"wrap"}}>
          {r.ktH>0&&<span style={{fontSize:9,background:"#FEF3C7",color:"#D97706",borderRadius:3,padding:"1px 5px",fontWeight:600}}>KT</span>}
          {r.calH>0&&<span style={{fontSize:9,background:"#CCFBF1",color:"#0D9488",borderRadius:3,padding:"1px 5px",fontWeight:600}}>Cal</span>}
          {r.ssH>0&&<span style={{fontSize:9,background:"#D1FAE5",color:"#10B981",borderRadius:3,padding:"1px 5px",fontWeight:600}}>SS -{r.aiGainPct}% AI</span>}
        </div>
        <div style={{height:4,background:T.border,borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:(r.sellWC/plan.reduce((s,x)=>Math.max(s,x.sellWC),1)*100)+"%",background:T.blue,borderRadius:100}}/></div>
        <div style={{fontSize:9,color:T.textSoft,marginTop:2}}>{r.totalH.toLocaleString()} hrs</div>
      </div>))}
    </div>
  </div>);
}

function Step5({data,sym,fxRate,currency}){
  const cvt=v=>currency==="GBP"?Math.round(v*(fxRate||0.79)):v;
  const base=calcBase(data.mods,data.spS,data.spY,data.avgL2,data.avgL3,data.tkt);
  const intgHrs=(data.intgs||[]).length*60;
  const blendC=blendedCostRate(data.ls,data.rates);
  const blendS=blendedSellRate(data.ls,data.rates,data.margins,data.fixedSell);
  const aiCurve=buildAIGainCurve(data.accelerators,data.totalYrs);
  const plan=buildPlan(base,intgHrs,data.ktMo,data.calMo,data.totalYrs,blendC,blendS,data.cont,aiCurve);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const totMargin=totSell-totCost;
  const annBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=Math.round(annBase/FTE_HRS*10)/10;
  const locFTEs=splitFTE(totalFTE,data.ls);
  const blendMP=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  const roleData=ROLES.map(r=>{const h=base.totalL2*r.l2w+base.totalL3*r.l3w+base.totalEnh*r.enhw+intgHrs*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);return{...r,fte:Math.round(h/FTE_HRS*10)/10};}).filter(r=>r.fte>0);
  const rC={R:"#10B981",A:"#EF4444",C:"#F59E0B",I:T.textSoft};
  const riskC={High:"#EF4444",Medium:"#F59E0B",Low:"#10B981"};
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {[[sym+Math.round(cvt(totSell/1000))+"K","Total Sell","#10B981"],[sym+Math.round(cvt(totCost/1000))+"K","Total Cost",T.blueDark],[sym+Math.round(cvt(totMargin/1000))+"K","Gross Margin","#F97316"],[blendMP+"%","Blended Margin",T.blue]].map(([v,l,c])=>(<div key={l} style={{background:T.bg,borderRadius:T.r,padding:"11px 13px",borderLeft:`3px solid ${c}`}}><div style={{fontSize:9,color:T.textSoft,marginBottom:1}}>{l}</div><div style={{fontSize:18,fontWeight:800,color:c,fontFamily:font.display}}>{v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
        <div style={sH}>Engagement Config</div>
        {[["Modules",data.mods.join(", ")],["Integrations",(data.intgs||[]).length+" selected"],["Years",data.totalYrs],["KT Period",data.ktMo+" months"],["Calibration",data.calMo+" months"],["Tickets/month",data.tkt],["SP/sprint",data.spS],["Total FTEs",totalFTE]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:11,color:T.textSoft}}>{l}</span><span style={{fontSize:11,fontWeight:600,color:T.text,textAlign:"right",maxWidth:"58%"}}>{v}</span></div>))}
      </div>
      <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
        <div style={sH}>Organisation Structure</div>
        {roleData.map(r=>(<div key={r.key} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",gap:2}}>{[["L2",r.l2],["L3",r.l3],["E",r.enh],["KT",r.kt]].map(([k,v])=>(<span key={k} style={{background:rC[v]+"18",color:rC[v],borderRadius:3,padding:"0 3px",fontSize:7.5,fontWeight:700}}>{k}:{v}</span>))}</div>
          <span style={{fontSize:10,color:T.text,flex:1}}>{r.label}</span>
          <span style={{fontSize:11,fontWeight:700,color:T.blue}}>{r.fte}</span>
        </div>))}
        <div style={{marginTop:7,paddingTop:5,borderTop:`2px solid ${T.blue}`}}>
          {LOCATIONS.filter(l=>locFTEs[l.key]>0).map(l=>(<div key={l.key} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontSize:11}}>{l.flag}</span><span style={{fontSize:10,color:T.textMid,flex:1}}>{l.label}</span><span style={{fontSize:11,fontWeight:700,color:l.color}}>{locFTEs[l.key]} FTE</span></div>))}
        </div>
      </div>
    </div>
    <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
      <div style={sH}>KT Plan</div>
      <div style={{display:"flex",gap:8}}>
        {[{t:"Discovery & Shadow",c:"#F59E0B",mo:1},{t:"Runbook Creation",c:"#14B8A6",mo:2},{t:"Primary Ownership",c:"#10B981",mo:3}].slice(0,Math.min(data.ktMo,3)).map(s=>(<div key={s.t} style={{flex:1,borderLeft:`3px solid ${s.c}`,paddingLeft:7}}><div style={{fontSize:9,fontWeight:700,color:s.c}}>Month {s.mo}</div><div style={{fontSize:11,color:T.text,fontWeight:600}}>{s.t}</div></div>))}
      </div>
      <div style={{marginTop:8,padding:"7px 10px",background:"#D1FAE5",borderRadius:T.r,fontSize:10,color:"#10B981",fontWeight:600}}>Calibration: Months {data.ktMo+1}–{data.ktMo+data.calMo} · SLA live Month {data.ktMo+data.calMo+1}</div>
    </div>
    <div style={{background:T.bg,borderRadius:T.rMd,padding:13}}>
      <div style={sH}>Top Risks</div>
      {RISKS.slice(0,3).map(r=>(<div key={r.id} style={{display:"flex",gap:8,padding:"6px 8px",background:T.white,borderRadius:T.r,border:`1px solid ${T.border}`,borderLeft:`3px solid ${riskC[r.impact]||T.border}`,marginBottom:5}}>
        <div style={{display:"flex",gap:3,flexShrink:0}}><span style={{fontSize:8,background:riskC[r.likelihood]+"18",color:riskC[r.likelihood],borderRadius:3,padding:"0 4px",fontWeight:600}}>L:{r.likelihood[0]}</span><span style={{fontSize:8,background:riskC[r.impact]+"18",color:riskC[r.impact],borderRadius:3,padding:"0 4px",fontWeight:600}}>I:{r.impact[0]}</span></div>
        <span style={{fontSize:10,color:T.text}}>{r.risk}</span>
      </div>))}
    </div>
  </div>);
}

export default function OppWizard({opp,onClose,onSave,sym,fxRate,currency}){
  const[step,setStep]=useState(1);
  const[data,setData]=useState({...opp});
  const[completed,setCompleted]=useState(opp.wizardComplete?5:0);
  function patch(p){setData(d=>({...d,...p}));}
  function handleNext(){setCompleted(c=>Math.max(c,step));setStep(s=>Math.min(s+1,5));}
  function handleBack(){setStep(s=>Math.max(s-1,1));}
  function handleSaveDraft(){onSave({...data,wizardStep:step,updatedAt:new Date().toISOString()},"");onClose();}
  function handleSubmit(){onSave({...data,wizardStep:5,wizardComplete:true,updatedAt:new Date().toISOString()},"submit");onClose();}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,62,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:T.white,borderRadius:20,boxShadow:"0 24px 80px rgba(13,27,62,0.22)",width:"100%",maxWidth:940,maxHeight:"94vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px",borderBottom:`1px solid ${T.border}`}}>
          <div><div style={{fontSize:16,fontWeight:800,color:T.text,fontFamily:font.display}}>{data.name||"New Engagement"}</div><div style={{fontSize:11,color:T.textSoft}}>{data.client||"No client"}{data.clientCity?" · "+data.clientCity:""}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{padding:"3px 10px",borderRadius:100,background:versionColor(data.version)+"20",color:versionColor(data.version),fontSize:10,fontWeight:700}}>{data.version||"Draft"}</div><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.textSoft,padding:"2px 6px"}}>×</button></div>
        </div>
        <StepBar current={step} completed={completed}/>
        <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
          {step===1&&<Step1 data={data} onChange={patch}/>}
          {step===2&&<Step2 data={data} onChange={patch} sym={sym} fxRate={fxRate} currency={currency}/>}
          {step===3&&<Step3 data={data} onChange={patch}/>}
          {step===4&&<Step4 data={data} onChange={patch} sym={sym} fxRate={fxRate} currency={currency}/>}
          {step===5&&<Step5 data={data} sym={sym} fxRate={fxRate} currency={currency}/>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 22px",borderTop:`1px solid ${T.border}`,background:T.bg}}>
          <div style={{display:"flex",gap:7}}>{step>1&&<Btn variant="secondary" onClick={handleBack}>← Back</Btn>}<Btn variant="ghost" onClick={handleSaveDraft}>Save Draft</Btn></div>
          <div style={{fontSize:10,color:T.textSoft}}>Step {step} of 5</div>
          {step<5?<Btn onClick={handleNext}>Next Step →</Btn>:<Btn onClick={handleSubmit}>Submit & View Dashboard →</Btn>}
        </div>
      </div>
    </div>
  );
}
