// src/pages/OtherPages.jsx
// Analytics, Cost, Team Mix, AI & Enablers, KT & Steady State, RACI & Risk

import {T} from "../design.js";
import {Card, Metric, SectionHead, Slider, Table, Badge, BarChart, ShoreBar, RaciBadge} from "../components/ui.jsx";
import {LOCATIONS, ROLES, RISKS, DEFAULT_AI_ACCELERATORS, AI_GAIN_CURVE, COVERAGE_OPTIONS, buildPlan, calcBase, blendedCostRate, blendedSellRate, getSellRate, splitFTERounded, roundFTE, FTE_HRS} from "../store/appData.js";

// ─── Analytics ────────────────────────────────────────────────────────────────
export function AnalyticsPage({opp,opps,sym,fxRate,currency}){
  if(!opp)return<NoOpp/>;
  const {ls,rates,margins,fixedSell,mods,intgs,spY,spS,ktMo,calMo,totalYrs,avgL2,avgL3,tkt,cont}=opp;
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const blendC=blendedCostRate(ls,rates);
  const blendS=blendedSellRate(ls,rates,margins,fixedSell);
  const plan=buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont,ls,opp?.accelerators);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=roundFTE(annualBase/FTE_HRS);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const totMargin=totSell-totCost;
  const blendedMarginPct=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  const locFTEs=splitFTERounded(totalFTE,ls);
  const hrsSaved=plan.reduce((s,r)=>s+(r.noAiHrs-r.totalH),0);

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="Analytics" sub="Programme performance metrics and projections"/>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <Metric label="Total Sell" value={sym+(totSell/1000000).toFixed(2)+"M"} icon="💰" color={T.blue}/>
        <Metric label="Gross Margin" value={sym+(totMargin/1000).toFixed(0)+"K"} sub={blendedMarginPct+"% blended"} icon="📈" color={T.green}/>
        <Metric label="Total Hours" value={plan.reduce((s,r)=>s+r.totalH,0).toLocaleString()} sub={totalYrs+" years"} icon="⏱" color={T.blueDark}/>
        <Metric label="AI Hours Saved" value={hrsSaved.toLocaleString()} sub={sym+Math.round(hrsSaved*blendC/1000)+"K cost saving"} icon="⚡" color={T.purple}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Year-by-Year Cost, Sell & Margin</div>
          <BarChart data={plan.map(r=>({label:"Y"+r.yr,cost:r.costWC,sell:r.sellWC,margin:r.sellWC-r.costWC}))} keys={["cost","sell","margin"]} colors={[T.blueDark,T.blue,T.green]} labels={["Cost","Sell","Margin"]} height={200} sym={sym}/>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Margin per Shore</div>
          {LOCATIONS.filter(l=>ls[l.key]>0).map(l=>{
            const sr=getSellRate(l.key,rates,margins,fixedSell);
            const cr=rates[l.key];
            const mp=sr>0?Math.round((sr-cr)/sr*100):0;
            return(<div key={l.key} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:T.textMid,display:"flex",gap:5}}><span>{l.flag}</span><span>{l.label}</span></span><span style={{fontWeight:700,color:l.color}}>{mp}%</span></div>
              <div style={{height:6,background:T.border,borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:mp+"%",background:l.color,borderRadius:100}}/></div>
            </div>);
          })}
        </Card>
      </div>
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Detailed Year Plan</div>
        <Table headers={["Year","Phase","Hours","FTEs","Cost","Sell","Margin","Margin %","AI Gain"]}
          rows={plan.map(r=>[
            <strong>Year {r.yr}</strong>,
            <span style={{fontSize:10,color:T.textSoft}}>{r.ktH>0?"KT+":""}{r.calH>0?"Cal+":""}{r.ssH>0?"SS":""}</span>,
            r.totalH.toLocaleString(),
            (r.totalH/FTE_HRS).toFixed(1),
            <span style={{color:T.blueDark,fontWeight:600}}>{sym}{(r.costWC/1000).toFixed(0)}K</span>,
            <span style={{color:T.blue,fontWeight:600}}>{sym}{(r.sellWC/1000).toFixed(0)}K</span>,
            <span style={{color:T.green,fontWeight:600}}>{sym}{((r.sellWC-r.costWC)/1000).toFixed(0)}K</span>,
            <span style={{color:T.green,fontWeight:600}}>{r.sellWC>0?Math.round((r.sellWC-r.costWC)/r.sellWC*100):0}%</span>,
            <Badge label={"-"+r.aiGainPct+"%"} color={T.purple}/>,
          ])} compact/>
      </Card>
    </div>
  );
}

// ─── Cost & Pricing ───────────────────────────────────────────────────────────
export function CostPage({opp,onUpdate,sym,fxRate,currency}){
  if(!opp)return<NoOpp/>;
  const {ls,rates,margins,fixedSell,cont}=opp;
  const intgHrs=(opp.intgs||[]).length*60;
  const base=calcBase(opp.mods||[],opp.spS,opp.spY,opp.avgL2,opp.avgL3,opp.tkt);
  const blendC=blendedCostRate(ls,rates);
  const blendS=blendedSellRate(ls,rates,margins,fixedSell);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=roundFTE(annualBase/FTE_HRS);
  const locFTEs=splitFTERounded(totalFTE,ls);
  const plan=buildPlan(base,intgHrs,opp.ktMo,opp.calMo,opp.totalYrs,blendC,blendS,cont,ls,opp.accelerators);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const blendedMarginPct=blendS>0?Math.round((blendS-blendC)/blendS*100):0;

  function updSplit(key,val){
    const oth=LOCATIONS.filter(l=>l.key!==key);const rem=100-val;const c2=oth.reduce((s,l)=>s+ls[l.key],0);
    const ns={...ls,[key]:val};
    if(c2>0){oth.forEach(l=>{ns[l.key]=Math.round((ls[l.key]/c2)*rem);});}
    else{const eq=Math.floor(rem/oth.length);oth.forEach((l,i)=>{ns[l.key]=i===oth.length-1?rem-eq*(oth.length-1):eq;});}
    onUpdate({ls:ns});
  }

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="Cost & Pricing" sub="Configure rates, margins and sell pricing per shore"/>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <Metric label="Blended Cost/hr" value={sym+Math.round(blendC)} sub="NTT DATA cost" icon="📉" color={T.blueDark}/>
        <Metric label="Blended Sell/hr" value={sym+Math.round(blendS)} sub="Client-facing rate" icon="📈" color={T.blue}/>
        <Metric label="Blended Margin" value={blendedMarginPct+"%"} sub={sym+Math.round(blendS-blendC)+"/hr"} icon="💹" color={T.green}/>
        <Metric label="Total Sell Price" value={sym+(totSell/1000000).toFixed(2)+"M"} sub={"w/ "+cont+"% contingency"} icon="💰" color={T.orange}/>
      </div>

      {/* Shore cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
        {LOCATIONS.map(loc=>{
          const sr=getSellRate(loc.key,rates,margins,fixedSell);
          const marginAmt=sr-rates[loc.key];
          const marginPct=sr>0?Math.round((sr-rates[loc.key])/sr*100):0;
          return(
            <Card key={loc.key} style={{padding:14,borderTop:`3px solid ${loc.color}`}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10}}><span style={{fontSize:16}}>{loc.flag}</span><div><div style={{fontSize:11,fontWeight:700,color:loc.color}}>{loc.label}</div><div style={{fontSize:9,color:T.textSoft}}>{loc.country}</div></div></div>
              <Slider label="Split %" min={0} max={100} value={ls[loc.key]} onChange={v=>updSplit(loc.key,v)} unit="%"/>
              <div style={{fontSize:20,fontWeight:800,color:loc.color,textAlign:"center",marginBottom:10}}>{ls[loc.key]}%</div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:T.textSoft,marginBottom:3}}>Cost Rate</div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,color:T.textSoft}}>{sym}</span><input type="number" min={20} max={400} value={rates[loc.key]} onChange={e=>onUpdate({rates:{...rates,[loc.key]:Math.max(20,Number(e.target.value))}})} style={{width:"100%",padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:T.r,fontSize:12,fontWeight:700,color:T.text,outline:"none"}}/></div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:T.textSoft,marginBottom:2}}>Margin %</div>
                <input type="range" min={0} max={70} value={margins[loc.key]} onChange={e=>{onUpdate({margins:{...margins,[loc.key]:Number(e.target.value)},fixedSell:{...fixedSell,[loc.key]:null}});}} style={{width:"100%",accentColor:T.green}}/>
                <div style={{textAlign:"center",fontSize:13,fontWeight:700,color:T.green}}>{margins[loc.key]}%</div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:T.textSoft,marginBottom:3}}>Fixed Sell Override</div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,color:T.textSoft}}>{sym}</span><input type="number" min={0} max={600} value={fixedSell[loc.key]||""} placeholder="optional" onChange={e=>onUpdate({fixedSell:{...fixedSell,[loc.key]:e.target.value?Number(e.target.value):null}})} style={{width:"100%",padding:"5px 8px",border:`1px solid ${fixedSell[loc.key]?T.purple:T.border}`,borderRadius:T.r,fontSize:11,color:fixedSell[loc.key]?T.purple:T.textSoft,outline:"none"}}/></div>
              </div>
              <div style={{background:T.bg,borderRadius:T.r,padding:"8px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:T.textSoft}}>FTEs</span><span style={{fontWeight:700,color:loc.color}}>{locFTEs[loc.key]}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:T.textSoft}}>Sell/hr</span><span style={{fontWeight:700,color:T.green}}>{sym}{Math.round(sr)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:T.textSoft}}>Margin/hr</span><span style={{fontWeight:700,color:T.orange}}>{sym}{Math.round(marginAmt)}</span></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary table */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Shore Pricing Summary</div>
        <ShoreBar data={LOCATIONS.filter(l=>ls[l.key]>0).map(l=>({label:l.flag+" "+l.label,val:Math.round(locFTEs[l.key]*getSellRate(l.key,rates,margins,fixedSell)*FTE_HRS),color:l.color}))} sym={sym}/>
        <div style={{marginTop:16}}>
          <Table headers={["Shore","FTEs","Split","Cost/hr","Margin %","Sell/hr","Margin/hr","Ann Revenue","Ann Margin"]}
            rows={LOCATIONS.filter(l=>ls[l.key]>0).map(l=>{const sr=Math.round(getSellRate(l.key,rates,margins,fixedSell));const cr=rates[l.key];const rev=Math.round(locFTEs[l.key]*sr*FTE_HRS);const margin=Math.round(locFTEs[l.key]*(sr-cr)*FTE_HRS);const mp=sr>0?Math.round((sr-cr)/sr*100):0;return[<span style={{display:"flex",gap:5,alignItems:"center"}}><span>{l.flag}</span><span style={{fontWeight:600,color:l.color}}>{l.label}</span></span>,locFTEs[l.key],ls[l.key]+"%",sym+cr,<Badge label={mp+"%"} color={T.green}/>,<span style={{fontWeight:600,color:T.green}}>{sym+sr}</span>,sym+Math.round(sr-cr),sym+Math.round(rev/1000)+"K",<span style={{fontWeight:600,color:T.green}}>{sym+Math.round(margin/1000)}K</span>];})} compact/>
        </div>
      </Card>
    </div>
  );
}

// ─── Team Mix ─────────────────────────────────────────────────────────────────
export function TeamPage({opp,onUpdate,sym}){
  if(!opp)return<NoOpp/>;
  const {mods,intgs,spY,spS,avgL2,avgL3,tkt,ls,rates}=opp;
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=roundFTE(annualBase/FTE_HRS);
  const locFTEs=splitFTERounded(totalFTE,ls);
  const roleData=ROLES.map(r=>{const h=base.totalL2*r.l2w+base.totalL3*r.l3w+base.totalEnh*r.enhw+intgHrs*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);return{...r,hrs:Math.round(h),fte:Math.round(h/FTE_HRS*10)/10};}).filter(r=>r.fte>0);

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="Team Mix" sub="Delivery team composition, location split, and role responsibilities"/>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <Metric label="Total FTEs" value={totalFTE} sub="Steady-state baseline" icon="👥" color={T.blue}/>
        <Metric label="L2 Hours/yr" value={base.totalL2.toLocaleString()} sub="Incident management" icon="🔧" color={T.amber}/>
        <Metric label="L3 Hours/yr" value={base.totalL3.toLocaleString()} sub="Gosu / problem mgmt" icon="⚙️" color={T.blueDark}/>
        <Metric label="Enhancement/yr" value={base.totalEnh.toLocaleString()} sub={spY+" sprints × "+spS+" SP"} icon="🚀" color={T.green}/>
        <Metric label="Integration/yr" value={intgHrs.toLocaleString()} sub={(intgs||[]).length+" integrations"} icon="🔗" color={T.teal}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        {/* Location breakdown */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>FTE Distribution by Shore</div>
          {LOCATIONS.filter(l=>ls[l.key]>0&&locFTEs[l.key]>0).map(l=>(
            <div key={l.key} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:T.text,display:"flex",gap:6,alignItems:"center"}}><span>{l.flag}</span><span style={{fontWeight:600}}>{l.label}</span></span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:T.textSoft}}>{ls[l.key]}%</span><span style={{fontSize:13,fontWeight:800,color:l.color}}>{locFTEs[l.key]} FTE</span></div>
              </div>
              <div style={{height:7,background:T.border,borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:ls[l.key]+"%",background:l.color,borderRadius:100}}/></div>
              <div style={{fontSize:10,color:T.textSoft,marginTop:2}}>{sym}{rates[l.key]}/hr · ~{sym}{Math.round(locFTEs[l.key]*rates[l.key]*FTE_HRS/1000)}K/yr cost</div>
            </div>
          ))}
        </Card>

        {/* Role breakdown */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>FTE by Role</div>
          {roleData.map(r=>(
            <div key={r.key} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:T.text,fontWeight:500}}>{r.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:T.blue}}>{r.fte} FTE</span>
              </div>
              <div style={{height:5,background:T.border,borderRadius:100,overflow:"hidden"}}><div style={{height:"100%",width:(r.fte/totalFTE*100)+"%",background:T.blue,borderRadius:100}}/></div>
              <div style={{fontSize:10,color:T.textSoft,marginTop:1}}>{r.hrs.toLocaleString()} hrs/yr</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Role detail table with location split */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Role × Location Breakdown</div>
        <Table headers={["Role","Total FTEs","Hrs/yr","Onsite 🏢","Offshore 🇮🇳","Nearshore MX 🇲🇽","Nearshore MA 🇲🇦","Alchemy NI 🏴󠁧󠁢󠁮󠁩󠁲󠁿","Description"]}
          rows={roleData.map(r=>[
            <span style={{fontWeight:600,color:T.text}}>{r.label}</span>,
            <span style={{fontWeight:700,color:T.blue}}>{r.fte}</span>,
            r.hrs.toLocaleString(),
            Math.round(r.fte*(ls.onsite/100)*10)/10||"—",
            Math.round(r.fte*(ls.offshore/100)*10)/10||"—",
            Math.round(r.fte*(ls.nearMX/100)*10)/10||"—",
            Math.round(r.fte*(ls.nearMA/100)*10)/10||"—",
            Math.round(r.fte*(ls.alchemy/100)*10)/10||"—",
            <span style={{fontSize:10,color:T.textSoft,maxWidth:200,display:"block"}}>{r.desc}</span>,
          ])} compact/>
      </Card>
    </div>
  );
}

// ─── AI & Enablers ────────────────────────────────────────────────────────────
export function AIPage({opp,sym,fxRate,currency}){
  if(!opp)return<NoOpp/>;
  const {mods,intgs,spY,spS,avgL2,avgL3,tkt,ls,rates,margins,fixedSell,ktMo,calMo,totalYrs,cont}=opp;
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const blendC=blendedCostRate(ls,rates);
  const blendS=blendedSellRate(ls,rates,margins,fixedSell);
  const plan=buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont,ls,opp?.accelerators);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const hrsSaved=plan.reduce((s,r)=>s+(r.noAiHrs-r.totalH),0);
  const impactColors={High:T.green,Medium:T.amber,Transformational:T.purple};

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="AI & Enablers" sub="NTT DATA AI accelerators for Guidewire AMS engagements"/>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        {AI_GAIN_CURVE.slice(0,totalYrs).map((g,i)=>(<Metric key={i} label={"Y"+(i+1)+" AI Gain"} value={Math.round(g*100)+"%"} sub={i===0?"Auto-triage active":i<3?"Predictive ops":"Full autonomous"} icon={i===0?"🤖":i<3?"⚡":"🚀"} color={i<2?T.teal:i<4?T.green:T.purple}/>))}
        <Metric label="Total Hrs Saved" value={hrsSaved.toLocaleString()} sub={sym+Math.round(hrsSaved*blendC/1000)+"K cost saving"} icon="⏱" color={T.blue}/>
      </div>

      {/* AI efficiency by year */}
      <Card style={{marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>AI Efficiency Progress by Year</div>
        <div style={{fontSize:12,color:T.textSoft,marginBottom:16}}>Hours saved vs no-AI baseline</div>
        <BarChart data={plan.map(r=>({label:"Y"+r.yr,noAi:r.noAiHrs,ai:r.totalH,saved:r.noAiHrs-r.totalH}))} keys={["saved","ai","noAi"]} colors={[T.green,T.blue,"#E2E8F0"]} labels={["Hrs Saved","With AI","No AI"]} height={160} sym=""/>
      </Card>

      {/* Accelerator cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {DEFAULT_AI_ACCELERATORS.map(ai=>{
          const col=impactColors[ai.impact]||T.blue;
          const gain=AI_GAIN_CURVE[Math.min(ai.gainIdx,AI_GAIN_CURVE.length-1)];
          return(
            <Card key={ai.id} style={{borderLeft:`3px solid ${col}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{ai.name}</div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Badge label={ai.timeline} color={col}/>
                  <Badge label={ai.impact} color={col}/>
                </div>
              </div>
              <div style={{fontSize:12,color:T.textMid,marginBottom:10,lineHeight:1.5}}>{ai.desc}</div>
              <div style={{display:"flex",gap:12,padding:"8px 10px",background:col+"10",borderRadius:T.r}}>
                <div style={{fontSize:11,color:col,fontWeight:600}}>Efficiency gain: {Math.round(gain*100)}%</div>
                <div style={{fontSize:11,color:T.textSoft,marginLeft:"auto"}}>~{sym}{Math.round(annualBase*gain*blendC/1000)}K/yr saving</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── KT & Steady State ────────────────────────────────────────────────────────
export function KTPage({opp,onUpdate,sym,fxRate,currency}){
  if(!opp)return<NoOpp/>;
  const {ktMo,calMo,totalYrs,spY,spS,mods,intgs,avgL2,avgL3,tkt,ls,rates,margins,fixedSell,cont,covKey}=opp;
  const coverage=COVERAGE_OPTIONS.find(c=>c.key===covKey)||COVERAGE_OPTIONS[0];
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const blendC=blendedCostRate(ls,rates);
  const blendS=blendedSellRate(ls,rates,margins,fixedSell);
  const plan=buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont,ls,opp?.accelerators);

  const KT_STEPS=[
    {mo:"Month 1",title:"Discovery & Shadow",color:T.amber,activities:["Onboard NTT DATA team across all delivery centres (incl. Alchemy NI)","Receive all docs: runbooks, architecture, Gosu code repos from incumbent","Shadow incidents across PC, CC, BC, Digital — observe triage & resolution","Map all "+intgHrs/60+" integrations: endpoints, auth, data flows","Establish GW Cloud access, ITSM credentials, monitoring tools","Interview incumbent: tribal knowledge capture sessions"],deliverable:"Discovery Report, Knowledge Gap Analysis"},
    {mo:"Month 2",title:"Runbook Creation & Parallel Ops",color:T.teal,activities:["Author runbooks for top 50 incident patterns per module","Gosu code walkthrough: extensions, business rules, plugins","Integration runbooks for all integrations","First NTT DATA-led resolutions (with oversight)","Enhancement backlog grooming commenced","GW Cloud ops certification for L2/L3 team"],deliverable:"50 Runbooks, Integration Playbooks"},
    {mo:"Month 3",title:"Primary Ownership + KT Sign-Off",color:T.green,activities:["NTT DATA takes primary incident ownership across all modules","Incumbent on advisory basis only","First enhancement sprint completed","KT Assessment: knowledge quiz + incident simulation","Integration monitoring fully transitioned","KT Sign-Off Gate: client + NTT DATA + incumbent"],deliverable:"KT Certificate, Full Runbook Library"},
  ];

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="KT & Steady State" sub="Knowledge transition phases, calibration, and steady-state plan"/>

      {/* Config sliders */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Phase Configuration</div>
          <Slider label="KT Duration" min={2} max={12} value={ktMo} onChange={v=>onUpdate({ktMo:v})} unit=" months"/>
          <Slider label="Calibration Period" min={1} max={6} value={calMo} onChange={v=>onUpdate({calMo:v})} unit=" months"/>
          <Slider label="Engagement Years" min={1} max={7} value={totalYrs} onChange={v=>onUpdate({totalYrs:v})} unit=" yrs"/>
          <Slider label="Sprints / Year" min={12} max={26} value={spY} onChange={v=>onUpdate({spY:v})} unit=""/>
          <Slider label="SP / Sprint" min={10} max={40} value={spS} onChange={v=>onUpdate({spS:v})} unit=" SP"/>
          <Slider label="Contingency %" min={0} max={30} value={cont} onChange={v=>onUpdate({cont:v})} unit="%"/>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Year-by-Year Phase Preview</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {plan.map(r=>(
              <div key={r.yr} style={{padding:"10px 12px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.text}}>Year {r.yr}</span>
                  <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{sym}{(r.sellWC/1000).toFixed(0)}K</span>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:4}}>
                  {r.ktH>0&&<Badge label={"KT: "+(r.ktH/((base.totalL2+base.totalL3+base.totalEnh+intgHrs)/12)).toFixed(1)+"mo"} color={T.amber}/>}
                  {r.calH>0&&<Badge label={"Cal: "+(r.calH/((base.totalL2+base.totalL3+base.totalEnh+intgHrs)/12)).toFixed(1)+"mo"} color={T.teal}/>}
                  {r.ssH>0&&<Badge label={"SS: "+(r.ssH/((base.totalL2+base.totalL3+base.totalEnh+intgHrs)/12)).toFixed(1)+"mo"} color={T.green}/>}
                </div>
                <div style={{fontSize:10,color:T.textSoft}}>{r.totalH.toLocaleString()} hrs · AI gain: -{r.aiGainPct}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KT timeline */}
      <Card style={{marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>KT Programme ({ktMo} months)</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {KT_STEPS.slice(0,Math.min(ktMo,3)).map(step=>(
            <div key={step.mo} style={{borderLeft:`3px solid ${step.color}`,paddingLeft:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color:step.color}}>{step.mo}: {step.title}</div>
                <Badge label="KT Phase" color={step.color}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 14px",marginBottom:6}}>
                {step.activities.map((a,i)=>(<div key={i} style={{fontSize:11,color:T.textMid,display:"flex",gap:5}}><span style={{color:step.color}}>▸</span><span>{a}</span></div>))}
              </div>
              <div style={{background:step.color+"12",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:600,color:step.color}}>Deliverable: {step.deliverable}</div>
            </div>
          ))}
          {ktMo>3&&<div style={{padding:"10px 14px",background:T.bg,borderRadius:T.r,fontSize:11,color:T.textMid}}>Months 4–{ktMo}: Extended parallel operations, advanced runbook coverage, integration monitoring transition complete.</div>}
        </div>
      </Card>

      {/* Calibration */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Calibration Period ({calMo} months)</div>
        <div style={{padding:"10px 14px",background:T.greenSoft,borderRadius:T.r,marginBottom:14,fontSize:12,color:T.green,fontWeight:600}}>
          SLA tracked but no credits or penalties apply · SLA live from Month {ktMo+calMo+1}
        </div>
        <Table headers={["Activity","Owner","Cadence"]} rows={[
          ["Track incident volumes vs. baseline","NTT DATA AMS Lead","Monthly"],
          ["Measure resolution times vs. SLA","Service Delivery Manager","Weekly"],
          ["Enhancement velocity tracking","Delivery Manager","Per Sprint"],
          ["Integration uptime & error tracking","Integration Lead","Continuous"],
          ["Calibration Review Report","NTT DATA SDM","Month "+(ktMo+calMo)],
          ["SLA credits and penalties activated","Contract Live","Month "+(ktMo+calMo+1)],
        ]} compact/>
      </Card>
    </div>
  );
}

// ─── RACI & Risk ─────────────────────────────────────────────────────────────
export function RACIPage({opp}){
  if(!opp)return<NoOpp/>;
  const {mods,intgs,spY,spS,avgL2,avgL3,tkt,ls}=opp;
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=roundFTE(annualBase/FTE_HRS);
  const locFTEs=splitFTERounded(totalFTE,ls);
  const roleData=ROLES.map(r=>{const h=base.totalL2*r.l2w+base.totalL3*r.l3w+base.totalEnh*r.enhw+intgHrs*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);return{...r,hrs:Math.round(h),fte:Math.round(h/FTE_HRS*10)/10};}).filter(r=>r.fte>0);
  const riskCol={High:T.red,Medium:T.amber,Low:T.green};

  return(
    <div style={{padding:"28px 28px 40px"}}>
      <SectionHead title="RACI & Risk" sub="Role responsibilities, org structure, and risk register"/>

      {/* RACI key */}
      <Card style={{marginBottom:18,padding:"14px 18px"}}>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:T.textMid}}>RACI Key:</span>
          {[["R","Responsible — does the work",T.green],["A","Accountable — owns outcome",T.red],["C","Consulted — provides input",T.amber],["I","Informed — kept updated",T.textSoft]].map(([k,d,col])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8}}><RaciBadge code={k}/><span style={{fontSize:12,color:T.textMid}}>{d}</span></div>))}
        </div>
      </Card>

      {/* Org structure visual */}
      <Card style={{marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:20}}>Org Structure</div>
        {/* SDM */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
          <OrgCard role={ROLES[0]} fte={roleData.find(r=>r.key==="sdm")?.fte||0} locFTEs={locFTEs} ls={ls}/>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:4}}><div style={{width:1,height:16,background:T.border}}/></div>
        {/* AMS Lead */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
          <OrgCard role={ROLES[1]} fte={roleData.find(r=>r.key==="lead")?.fte||0} locFTEs={locFTEs} ls={ls}/>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:4}}><div style={{width:1,height:16,background:T.border}}/></div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:4}}><div style={{width:"80%",height:1,background:T.border}}/></div>
        {/* Other roles */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          {ROLES.slice(2).map(r=>{const rd=roleData.find(x=>x.key===r.key);return rd&&rd.fte>0?<OrgCard key={r.key} role={r} fte={rd.fte} locFTEs={locFTEs} ls={ls}/>:null;})}
        </div>
      </Card>

      {/* RACI matrix table */}
      <Card style={{marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Full RACI Matrix</div>
        <Table headers={["Role","FTEs","L2 Incidents","L3 Problem Mgmt","Enhancement","KT Phase","Description"]}
          rows={roleData.map(r=>[
            <span style={{fontWeight:600,color:T.text}}>{r.label}</span>,
            <span style={{fontWeight:700,color:T.blue}}>{r.fte}</span>,
            <RaciBadge code={r.l2}/>,<RaciBadge code={r.l3}/>,<RaciBadge code={r.enh}/>,<RaciBadge code={r.kt}/>,
            <span style={{fontSize:10,color:T.textSoft}}>{r.desc}</span>,
          ])} compact/>
      </Card>

      {/* Risk register */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Risk Register</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {RISKS.map(r=>(
            <div key={r.id} style={{padding:"12px 14px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`,borderLeft:`3px solid ${riskCol[r.impact]||T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text}}>{r.risk}</div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Badge label={"L: "+r.likelihood} color={riskCol[r.likelihood]||T.textSoft}/>
                  <Badge label={"I: "+r.impact} color={riskCol[r.impact]||T.textSoft}/>
                </div>
              </div>
              <div style={{fontSize:11,color:T.textSoft,display:"flex",gap:5}}><span style={{color:T.blue,fontWeight:600}}>Mitigation:</span><span>{r.mitigation}</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OrgCard({role,fte,locFTEs,ls}){
  const topLoc=LOCATIONS.reduce((best,l)=>ls[l.key]>ls[best.key]?l:best,LOCATIONS[0]);
  const raciC={R:T.green,A:T.red,C:T.amber,I:T.textSoft};
  return(
    <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:T.rMd,padding:"12px 14px",minWidth:160,maxWidth:180,boxShadow:T.shadow}}>
      <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:4,lineHeight:1.3}}>{role.label}</div>
      <div style={{fontSize:9,color:T.textSoft,marginBottom:8,lineHeight:1.4}}>{role.desc}</div>
      <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
        {[["L2",role.l2],["L3",role.l3],["Enh",role.enh],["KT",role.kt]].map(([k,v])=>(<span key={k} style={{background:raciC[v]+"18",color:raciC[v],border:`1px solid ${raciC[v]}30`,borderRadius:4,padding:"0 5px",fontSize:8,fontWeight:700}}>{k}:{v}</span>))}
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:T.textSoft}}>{topLoc.flag} {topLoc.label}</span>
        <span style={{fontSize:13,fontWeight:800,color:T.blue}}>{fte} FTE</span>
      </div>
    </div>
  );
}

function NoOpp(){
  return(
    <div style={{padding:60,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>📋</div>
      <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>No opportunity selected</div>
      <div style={{fontSize:13,color:T.textSoft}}>Select an opportunity from the Opportunities page to view this section</div>
    </div>
  );
}
