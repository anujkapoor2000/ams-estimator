// exportUtils.js — PptxGenJS v3 + jsPDF  (fixed API: ShapeType.rect, numeric dims)
const NTT_BLUE="003087",NTT_RED="E4002B",NTT_NAVY="001A4E",NTT_LIGHT="EEF3FB",NTT_MID="64748B",WHITE="FFFFFF";
const SW=10,SH=7.5;

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector('script[src="'+src+'"]')){resolve();return;}
    const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}
async function ensurePptx(){await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js");}
async function ensureJsPDF(){
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
}

function hdr(prs,title,sub){
  const sl=prs.addSlide();
  sl.addShape(prs.ShapeType.rect,{x:0,y:0,w:SW,h:1.05,fill:{color:NTT_NAVY}});
  sl.addShape(prs.ShapeType.rect,{x:0,y:1.05,w:SW,h:0.06,fill:{color:NTT_RED}});
  sl.addShape(prs.ShapeType.rect,{x:0.35,y:0.16,w:1.05,h:0.4,fill:{color:NTT_RED}});
  sl.addText("NTT DATA",{x:0.35,y:0.16,w:1.05,h:0.4,fontSize:9,bold:true,color:WHITE,align:"center",valign:"middle",fontFace:"Arial"});
  sl.addText(title,{x:1.55,y:0.1,w:8.1,h:0.55,fontSize:18,bold:true,color:WHITE,fontFace:"Arial",valign:"middle"});
  if(sub)sl.addText(sub,{x:1.55,y:0.65,w:8.1,h:0.3,fontSize:8.5,color:"93C5FD",fontFace:"Arial"});
  sl.addText("NTT DATA — Guidewire Practice  |  Confidential  |  "+new Date().getFullYear(),
    {x:0,y:SH-0.3,w:SW,h:0.28,fontSize:7,color:NTT_MID,align:"center",fontFace:"Arial"});
  return sl;
}

function kpis(sl,prs,items,y){
  const w=(SW-0.7)/items.length-0.07;
  items.forEach((k,i)=>{
    const x=0.35+i*(w+0.07);
    sl.addShape(prs.ShapeType.rect,{x,y,w,h:1.08,fill:{color:NTT_LIGHT},line:{color:"D1D9E6",pt:0.5}});
    sl.addShape(prs.ShapeType.rect,{x,y,w:0.06,h:1.08,fill:{color:k.c||NTT_BLUE}});
    sl.addText(k.l.toUpperCase(),{x:x+0.1,y:y+0.08,w:w-0.14,h:0.2,fontSize:6,color:NTT_MID,bold:true,fontFace:"Arial"});
    sl.addText(k.v,              {x:x+0.1,y:y+0.26,w:w-0.14,h:0.5,fontSize:18,color:k.c||NTT_BLUE,bold:true,fontFace:"Arial"});
    if(k.s)sl.addText(k.s,      {x:x+0.1,y:y+0.78,w:w-0.14,h:0.22,fontSize:6.5,color:NTT_MID,fontFace:"Arial"});
  });
}

function tbl(sl,prs,heads,rows,y,opts){
  const x=(opts&&opts.x!==undefined)?opts.x:0.35;
  const tw=(opts&&opts.w)?opts.w:SW-0.7;
  const rh=(opts&&opts.rh)?opts.rh:0.26;
  const data=[
    heads.map(h=>({text:String(h),options:{bold:true,color:WHITE,fill:{color:NTT_NAVY},fontSize:7,align:"center",fontFace:"Arial"}})),
    ...rows.map((row,ri)=>row.map((c,ci)=>({
      text:String(c===null||c===undefined?"":c),
      options:{fontSize:7,color:"2D3748",fill:{color:ri%2===0?WHITE:NTT_LIGHT},align:ci===0?"left":"center",bold:ci===0,fontFace:"Arial"}
    })))
  ];
  const o={x,y,w:tw,rowH:rh,border:{type:"solid",pt:0.3,color:"E2E8F0"}};
  if(opts&&opts.colW)o.colW=opts.colW;
  sl.addTable(data,o);
}

export async function exportToPptx(data){
  await ensurePptx();
  const P=window.PptxGenJS;
  const prs=new P();
  prs.layout="LAYOUT_WIDE";
  prs.title="GW Cloud AMS — NTT DATA";

  const{selectedModules:mods,selectedIntegrations:intgs,
    spPerSprint,sprintsPerYear,teamRate,ktMonths,calMonths,currency,
    serviceCoverage,avgHrsL2,avgHrsL3,ticketsPerMonth,contingency,
    locSplit,rates,locations,
    clientName="",clientCity="",clientRegion="",engagementRef="",deliveryLocDetails=[],
    base,annual,totalBaseHrs,integrationHrs,totalProgramCost,
    totalRaw,contingencyAmt,ktHrs,calHrs,ssHrs,totalFTE,locFTEs,roles}=data;
  const sym=currency==="USD"?"$":"£";
  const FTE_HRS=1760;

  // Slide 1 — Cover
  const s1=prs.addSlide();
  s1.addShape(prs.ShapeType.rect,{x:0,y:0,w:SW,h:SH,fill:{color:NTT_NAVY}});
  s1.addShape(prs.ShapeType.rect,{x:0,y:5.1,w:SW,h:2.4,fill:{color:NTT_BLUE}});
  s1.addShape(prs.ShapeType.rect,{x:0,y:5.06,w:SW,h:0.1,fill:{color:NTT_RED}});
  s1.addShape(prs.ShapeType.rect,{x:0.4,y:0.38,w:1.4,h:0.5,fill:{color:NTT_RED}});
  s1.addText("NTT DATA",{x:0.4,y:0.38,w:1.4,h:0.5,fontSize:13,bold:true,color:WHITE,align:"center",valign:"middle",fontFace:"Arial"});
  s1.addText("GUIDEWIRE PRACTICE",{x:2.0,y:0.46,w:5,h:0.34,fontSize:10,color:"93C5FD",fontFace:"Arial"});
  s1.addText("Guidewire Cloud AMS\nEngagement Estimator",{x:0.4,y:1.5,w:9.2,h:2.2,fontSize:38,bold:true,color:WHITE,fontFace:"Arial"});
  s1.addText("PC · CC · BC · Digital (Jutro) · Onsite / Offshore / Nearshore · L2/L3 · Enhancements · 3-Year AI-Augmented",{x:0.4,y:3.85,w:9.2,h:0.36,fontSize:10,color:"93C5FD",fontFace:"Arial"});
  s1.addText("3-Year Programme Cost (incl. "+contingency+"% contingency)",{x:0.4,y:5.28,w:9.2,h:0.3,fontSize:11,color:"93C5FD",fontFace:"Arial"});
  s1.addText(sym+(totalProgramCost/1000000).toFixed(2)+"M",{x:0.4,y:5.56,w:9.2,h:0.62,fontSize:30,bold:true,color:WHITE,fontFace:"Arial"});
  if(clientName){
    s1.addShape(prs.ShapeType.rect,{x:0.4,y:4.56,w:9.2,h:0.42,fill:{color:"00000030"}});
    s1.addText("CLIENT: "+clientName.toUpperCase()+(clientCity?" | "+clientCity.toUpperCase():""),{x:0.55,y:4.6,w:9.0,h:0.34,fontSize:11,bold:true,color:"FCD34D",fontFace:"Arial"});
  }
  s1.addText(mods.length+" modules · "+intgs.length+" integrations · "+sym+teamRate+"/hr blended · Coverage: "+serviceCoverage,{x:0.4,y:6.2,w:9.2,h:0.3,fontSize:10,color:"93C5FD",fontFace:"Arial"});
  if(deliveryLocDetails&&deliveryLocDetails.length>0){
    s1.addText("Delivery: "+deliveryLocDetails.map(d=>d.flag+" "+d.label).join("  ·  "),{x:0.4,y:6.48,w:9.2,h:0.26,fontSize:9,color:"93C5FD",fontFace:"Arial"});
  }
  s1.addText("NTT DATA — Guidewire Practice  |  Confidential  |  "+new Date().getFullYear(),{x:0,y:SH-0.3,w:SW,h:0.28,fontSize:7,color:"64748B",align:"center",fontFace:"Arial"});

  // Slide 2 — Team & Location Model
  const s2=hdr(prs,"Team Model — Location Split & Rates","Onsite · Offshore (India) · Nearshore (Mexico & Morocco) · Blended Rate: "+sym+teamRate+"/hr");
  kpis(s2,prs,[
    {l:"Total FTEs",v:String(totalFTE),s:"Steady-state baseline",c:NTT_BLUE},
    {l:"KT Phase FTEs",v:String(Math.round(ktHrs/FTE_HRS*10)/10),s:"Months 1-"+ktMonths+" incl. overhead",c:"D97706"},
    {l:"SS FTEs (Post-cal)",v:String(Math.round(ssHrs/FTE_HRS*10)/10),s:"Full steady-state",c:"0A7C59"},
    {l:"Contingency",v:contingency+"%",s:sym+(contingencyAmt/1000).toFixed(0)+"K over 3 years",c:"C2410C"},
  ],1.22);
  tbl(s2,prs,["Location","Country","Split %","FTEs","Rate/hr","Annual Hrs","Annual Cost"],
    [...locations.map(loc=>[loc.flag+" "+loc.label,loc.country,locSplit[loc.key]+"%",locFTEs[loc.key],sym+rates[loc.key],Math.round(locFTEs[loc.key]*FTE_HRS).toLocaleString(),sym+Math.round(locFTEs[loc.key]*rates[loc.key]*FTE_HRS/1000)+"K"]),
     ["TOTAL","","100%",totalFTE,sym+teamRate+" blended",(totalFTE*FTE_HRS).toLocaleString(),sym+Math.round(totalFTE*teamRate*FTE_HRS/1000)+"K"]],2.44);
  s2.addText("Role-Based FTE Distribution",{x:0.35,y:4.5,w:9.3,h:0.24,fontSize:9,bold:true,color:NTT_BLUE,fontFace:"Arial"});
  tbl(s2,prs,["Role","Hrs/yr","FTEs","Onsite","Offshore IN","Nearshore MX","Nearshore MA"],
    roles.map(r=>[r.label,r.hrs.toLocaleString(),r.fte,
      Math.round(r.fte*(locSplit.onsite/100)*10)/10,
      Math.round(r.fte*(locSplit.offshore/100)*10)/10,
      Math.round(r.fte*(locSplit.nearshoreM/100)*10)/10,
      Math.round(r.fte*(locSplit.nearshoreMO/100)*10)/10]),4.76,{rh:0.24});

  // Slide 3 — KT vs Steady-State Phase Split
  const ktFraction=ktMonths/12,ssFraction=(12-ktMonths-calMonths)/12;
  const s3=hdr(prs,"KT vs Steady-State Phase Breakdown","KT overhead: 40%  |  Calibration: no SLA penalties  |  SLA live Month "+(ktMonths+calMonths+1));
  kpis(s3,prs,[
    {l:"KT Phase Hrs",v:ktHrs.toLocaleString(),s:sym+Math.round(ktHrs*teamRate*(1+contingency/100)/1000)+"K · "+Math.round(ktHrs/FTE_HRS*10)/10+" FTEs",c:"D97706"},
    {l:"Calibration Hrs",v:calHrs.toLocaleString(),s:sym+Math.round(calHrs*teamRate*(1+contingency/100)/1000)+"K · "+(calHrs/FTE_HRS).toFixed(1)+" FTEs",c:"0891B2"},
    {l:"SS Y1 Hrs",v:ssHrs.toLocaleString(),s:sym+Math.round(ssHrs*teamRate*(1+contingency/100)/1000)+"K · "+Math.round(ssHrs/FTE_HRS*10)/10+" FTEs",c:"0A7C59"},
    {l:"3-Year Total",v:sym+(totalProgramCost/1000000).toFixed(2)+"M",s:"Base "+sym+(totalRaw/1000000).toFixed(2)+"M + "+contingency+"% cont.",c:NTT_RED},
  ],1.22);
  tbl(s3,prs,["Phase","Period","Hrs","FTEs","Base Cost","w/ Contingency","Note"],[
    ["KT / Mobilisation","Months 1-"+ktMonths,ktHrs.toLocaleString(),Math.round(ktHrs/FTE_HRS*10)/10,sym+Math.round(ktHrs*teamRate/1000)+"K",sym+Math.round(ktHrs*teamRate*(1+contingency/100)/1000)+"K","40% overhead — shadowing & docs"],
    ["Calibration","Months "+(ktMonths+1)+"-"+(ktMonths+calMonths),calHrs.toLocaleString(),(calHrs/FTE_HRS).toFixed(1),sym+Math.round(calHrs*teamRate/1000)+"K",sym+Math.round(calHrs*teamRate*(1+contingency/100)/1000)+"K","No SLA penalties"],
    ["Steady-State Y1","Months "+(ktMonths+calMonths+1)+"-12",ssHrs.toLocaleString(),Math.round(ssHrs/FTE_HRS*10)/10,sym+Math.round(ssHrs*teamRate/1000)+"K",sym+Math.round(ssHrs*teamRate*(1+contingency/100)/1000)+"K","SLA credits/penalties active"],
    ["Steady-State Y2","Months 13-24",annual[1].hrs.toLocaleString(),(annual[1].hrs/FTE_HRS).toFixed(1),sym+(annual[1].raw/1000).toFixed(0)+"K",sym+(annual[1].cost/1000).toFixed(0)+"K","AI savings: 18%"],
    ["Steady-State Y3","Months 25-36",annual[2].hrs.toLocaleString(),(annual[2].hrs/FTE_HRS).toFixed(1),sym+(annual[2].raw/1000).toFixed(0)+"K",sym+(annual[2].cost/1000).toFixed(0)+"K","AI savings: 28%"],
  ],2.44);
  tbl(s3,prs,["Location","KT FTEs","KT Cost","Cal FTEs","SS Y1 FTEs","SS Y1 Cost","Y2 FTEs","Y3 FTEs"],
    [...locations.map(loc=>{
      const pct=locSplit[loc.key]/100,r=rates[loc.key];
      return[loc.flag+" "+loc.label,Math.round(ktHrs/FTE_HRS*pct*10)/10,sym+Math.round(ktHrs/FTE_HRS*pct*r*FTE_HRS/1000)+"K",Math.round(calHrs/FTE_HRS*pct*10)/10,Math.round(ssHrs/FTE_HRS*pct*10)/10,sym+Math.round(ssHrs/FTE_HRS*pct*r*FTE_HRS/1000)+"K",Math.round(annual[1].hrs/FTE_HRS*pct*10)/10,Math.round(annual[2].hrs/FTE_HRS*pct*10)/10];
    })],5.18,{rh:0.24});

  // Slide 4 — Estimation
  const s4=hdr(prs,"Estimation Summary","Annual hours & FTEs  |  Avg L2: "+avgHrsL2+"h · Avg L3: "+avgHrsL3+"h · "+ticketsPerMonth+" tickets/month");
  kpis(s4,prs,[
    {l:"Total Annual Hrs",v:totalBaseHrs.toLocaleString(),s:"Before AI gains",c:NTT_BLUE},
    {l:"Total FTEs",v:String(totalFTE),s:"Blended "+sym+teamRate+"/hr",c:NTT_NAVY},
    {l:"SP/Year",v:String(spPerSprint*sprintsPerYear),s:sprintsPerYear+" spr x "+spPerSprint+" SP",c:"0A7C59"},
    {l:"Integration Hrs",v:String(integrationHrs),s:intgs.length+" integ x 60 hrs",c:"0891B2"},
  ],1.22);
  tbl(s4,prs,["Module","L2 Tickets/yr","L2 Hrs","L3 Tickets/yr","L3 Hrs","Total Hrs","FTEs","Cost/yr"],
    mods.map(m=>{const d=base.byModule[m];if(!d)return[m,"-","-","-","-","-","-","-"];const t=d.l2hrs+d.l3hrs;const fte=t/FTE_HRS;return[m,d.l2vol,d.l2hrs.toLocaleString(),d.l3vol,d.l3hrs.toLocaleString(),t.toLocaleString(),fte.toFixed(1),sym+Math.round(fte*teamRate*FTE_HRS/1000)+"K"];}),2.44);

  // Slide 5 — 3-Year Cost
  const s5=hdr(prs,"3-Year Cost & Effort Summary","AI efficiency: 8%→18%→28%  |  "+contingency+"% contingency applied  |  Coverage: "+serviceCoverage);
  kpis(s5,prs,[
    {l:"Year 1",v:sym+(annual[0].cost/1000).toFixed(0)+"K",s:annual[0].hrs.toLocaleString()+" hrs",c:NTT_BLUE},
    {l:"Year 2",v:sym+(annual[1].cost/1000).toFixed(0)+"K",s:annual[1].hrs.toLocaleString()+" hrs",c:"0891B2"},
    {l:"Year 3",v:sym+(annual[2].cost/1000).toFixed(0)+"K",s:annual[2].hrs.toLocaleString()+" hrs",c:"0A7C59"},
    {l:"3-Yr Total",v:sym+(totalProgramCost/1000000).toFixed(2)+"M",s:"Contingency: "+sym+(contingencyAmt/1000).toFixed(0)+"K",c:NTT_RED},
  ],1.22);
  tbl(s5,prs,["Stream","Y1 Hrs","Y1 Base","Y1 w/Cont","Y2 Hrs","Y2 w/Cont","Y3 Hrs","Y3 w/Cont"],[
    ["L2 Incident Mgmt",annual[0].l2.toLocaleString(),sym+Math.round(annual[0].l2*teamRate/1000)+"K",sym+Math.round(annual[0].l2*teamRate*(1+contingency/100)/1000)+"K",annual[1].l2.toLocaleString(),sym+Math.round(annual[1].l2*teamRate*(1+contingency/100)/1000)+"K",annual[2].l2.toLocaleString(),sym+Math.round(annual[2].l2*teamRate*(1+contingency/100)/1000)+"K"],
    ["L3 Problem Mgmt", annual[0].l3.toLocaleString(),sym+Math.round(annual[0].l3*teamRate/1000)+"K",sym+Math.round(annual[0].l3*teamRate*(1+contingency/100)/1000)+"K",annual[1].l3.toLocaleString(),sym+Math.round(annual[1].l3*teamRate*(1+contingency/100)/1000)+"K",annual[2].l3.toLocaleString(),sym+Math.round(annual[2].l3*teamRate*(1+contingency/100)/1000)+"K"],
    ["Enhancements",    annual[0].enh.toLocaleString(),sym+Math.round(annual[0].enh*teamRate/1000)+"K",sym+Math.round(annual[0].enh*teamRate*(1+contingency/100)/1000)+"K",annual[1].enh.toLocaleString(),sym+Math.round(annual[1].enh*teamRate*(1+contingency/100)/1000)+"K",annual[2].enh.toLocaleString(),sym+Math.round(annual[2].enh*teamRate*(1+contingency/100)/1000)+"K"],
    ["Integration AMS", annual[0].intg.toLocaleString(),sym+Math.round(annual[0].intg*teamRate/1000)+"K",sym+Math.round(annual[0].intg*teamRate*(1+contingency/100)/1000)+"K",annual[1].intg.toLocaleString(),sym+Math.round(annual[1].intg*teamRate*(1+contingency/100)/1000)+"K",annual[2].intg.toLocaleString(),sym+Math.round(annual[2].intg*teamRate*(1+contingency/100)/1000)+"K"],
    ["TOTAL",annual[0].hrs.toLocaleString(),sym+(annual[0].raw/1000).toFixed(0)+"K",sym+(annual[0].cost/1000).toFixed(0)+"K",annual[1].hrs.toLocaleString(),sym+(annual[1].cost/1000).toFixed(0)+"K",annual[2].hrs.toLocaleString(),sym+(annual[2].cost/1000).toFixed(0)+"K"],
  ],2.44);

  // Slide 6 — SLA Framework
  const s6=hdr(prs,"SLA Framework & Credit/Penalty Model","SLA live Month "+(ktMonths+calMonths+1)+"  |  Coverage: "+serviceCoverage);
  tbl(s6,prs,["Priority","Definition","Response","Resolution","Penalty/Breach","Credit Cap"],[
    ["P1 - Critical","GW prod down / major business impact","15 min","4 hrs","5% monthly fee","15%"],
    ["P2 - High","Significant impairment, workaround exists","30 min","8 hrs","2% monthly fee","10%"],
    ["P3 - Medium","Non-critical, limited user impact","2 hrs","24 hrs","1% monthly fee","5%"],
    ["P4 - Low","Cosmetic / informational","4 hrs","72 hrs","0.5% monthly fee","2%"],
  ],1.22);
  s6.addShape(prs.ShapeType.rect,{x:0.35,y:2.56,w:9.3,h:0.9,fill:{color:"FFF7ED"},line:{color:"FED7AA",pt:0.5}});
  s6.addText("Credits from Month "+(ktMonths+calMonths+1)+". Max: 25% fee. Exclusions: GW Cloud outages, client delays, freeze. Incentive: >98% x3mo = 1% reduction.",{x:0.5,y:2.64,w:9.0,h:0.72,fontSize:8,color:"2D3748",fontFace:"Arial"});
  s6.addText("Integration SLA Addendum",{x:0.35,y:3.56,w:9.3,h:0.24,fontSize:9,bold:true,color:NTT_BLUE,fontFace:"Arial"});
  tbl(s6,prs,["Integration","Monitoring","Alert SLA","Fix SLA (P2)","Escalation"],
    intgs.map(i=>[i,"24x7 automated","15 min","8 hrs","GW + Vendor bridge"]),3.82,{rh:0.24});

  // Slide 7 — AI Capabilities
  const s7=hdr(prs,"AI Capabilities Roadmap","Augmenting all AMS layers Y1-Y3");
  kpis(s7,prs,[
    {l:"Y1 AI Gain",v:"8%",s:"Auto-triage & copilot",c:"0891B2"},
    {l:"Y2 AI Gain",v:"18%",s:"Predictive ops",c:"0A7C59"},
    {l:"Y3 AI Gain",v:"28%",s:"Autonomous L2",c:"6D28D9"},
    {l:"3-Yr Hrs Saved",v:(totalBaseHrs*3-annual.reduce((s,a)=>s+a.hrs,0)).toLocaleString(),s:"vs. no-AI baseline",c:NTT_BLUE},
  ],1.22);
  tbl(s7,prs,["Accelerator","Timeline","Impact","Benefit"],[
    ["GW Incident Auto-Triage","Y1 Q1","High","Triage 30min to <5min. Routes to L2/L3; suggests resolution."],
    ["Gosu Code Copilot","Y1 Q2","High","Real-time Gosu suggestions, anti-pattern detection, unit tests."],
    ["Incident Predictor","Y1 Q3","Medium","ML predicts spikes; pre-scales team capacity."],
    ["AI Release Notes Summariser","Y1 Q4","Medium","Processes GW releases; saves ~16 hrs per cycle."],
    ["GW Test DataHub AI","Y2 Q1","High","GDPR-safe test data generation. UAT setup -60%."],
    ["Autonomous L2 Agent","Y3 Q1","Transformational","30-40% of L2 resolved autonomously via runbooks."],
  ],2.44,{colW:[2.8,0.85,1.05,4.65]});

  // Slide 8 — KT Plan
  const s8=hdr(prs,"Knowledge Transition Plan",ktMonths+"-month KT + "+calMonths+"-month calibration  |  SLA live Month "+(ktMonths+calMonths+1));
  const cw=(SW-0.7)/3;
  [{t:"Month 1: Discovery & Shadow",c:"D97706",pts:["Onboard NTT DATA team — Onsite + Offshore IN + Nearshore MX & MA","Shadow incumbent across PC, CC, BC, Jutro — observe triage & resolution","Map all "+intgs.length+" integrations: endpoints, auth, data flows","Deliverable: Discovery Report, Knowledge Gap Analysis"]},
   {t:"Month 2: Runbook Creation & Parallel Ops",c:"0891B2",pts:["Author runbooks for top 50 incident patterns per module","Gosu code walkthrough: extensions, business rules, plugins","First NTT DATA-led resolutions under incumbent oversight","Deliverable: 50 Runbooks, Integration Playbooks"]},
   {t:"Month 3: Primary Ownership + Sign-Off",c:"0A7C59",pts:["NTT DATA takes primary ownership across all modules","First enhancement sprint completed & demonstrated","KT assessment: knowledge quiz + incident simulation","Deliverable: KT Certificate, Full Runbook Library"]},
  ].slice(0,Math.min(ktMonths,3)).forEach((ph,i)=>{
    const x=0.35+i*(cw+0.05);
    s8.addShape(prs.ShapeType.rect,{x,y:1.22,w:cw,h:4.62,fill:{color:NTT_LIGHT},line:{color:"E2E8F0",pt:0.5}});
    s8.addShape(prs.ShapeType.rect,{x,y:1.22,w:cw,h:0.06,fill:{color:ph.c}});
    s8.addShape(prs.ShapeType.rect,{x,y:1.22,w:cw,h:0.44,fill:{color:ph.c+"22"}});
    s8.addText(ph.t,{x:x+0.1,y:1.25,w:cw-0.14,h:0.38,fontSize:7.5,bold:true,color:ph.c,fontFace:"Arial"});
    ph.pts.forEach((p,j)=>{s8.addText("  "+p,{x:x+0.1,y:1.72+j*0.7,w:cw-0.14,h:0.62,fontSize:7,color:"2D3748",fontFace:"Arial",bullet:{type:"number"}});});
  });
  s8.addShape(prs.ShapeType.rect,{x:0.35,y:5.98,w:9.3,h:0.72,fill:{color:"EFF6FF"},line:{color:"BFDBFE",pt:0.5}});
  s8.addText("Calibration ("+calMonths+" months, Months "+(ktMonths+1)+"-"+(ktMonths+calMonths)+"):  SLA tracked, no penalties. Credits activate Month "+(ktMonths+calMonths+1)+".",
    {x:0.5,y:6.02,w:9.1,h:0.6,fontSize:8.5,color:NTT_BLUE,fontFace:"Arial"});

  await prs.writeFile({fileName:"NTT-DATA-GW-AMS-Estimator.pptx"});
}

export async function exportToPdf(data){
  await ensureJsPDF();
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
  const{selectedModules:mods,selectedIntegrations:intgs,
    spPerSprint,sprintsPerYear,teamRate,ktMonths,calMonths,currency,
    serviceCoverage,avgHrsL2,avgHrsL3,ticketsPerMonth,contingency,
    locSplit,rates,locations,
    clientName="",clientCity="",engagementRef="",deliveryLocDetails=[],
    base,annual,totalBaseHrs,integrationHrs,totalProgramCost,
    totalRaw,contingencyAmt,ktHrs,calHrs,ssHrs,totalFTE,locFTEs,roles}=data;
  const sym=currency==="USD"?"$":"£";
  const W=297,FTE_HRS=1760;

  function ph(title,sub,pg){
    doc.setFillColor(0,26,78);doc.rect(0,0,W,17,"F");
    doc.setFillColor(228,0,43);doc.rect(0,17,W,1.2,"F");
    doc.setFillColor(228,0,43);doc.rect(7,2.5,22,8,"F");
    doc.setTextColor(255,255,255);doc.setFontSize(8);doc.setFont("helvetica","bold");
    doc.text("NTT DATA",18,8,{align:"center"});
    doc.setFontSize(13);doc.text(title,33,9);
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);
    if(sub)doc.text(sub,33,14);
    doc.setTextColor(100,116,139);doc.setFontSize(7);
    doc.text("Page "+pg+"  |  NTT DATA Guidewire Practice  |  Confidential",W-7,207,{align:"right"});
    doc.setTextColor(0,0,0);
  }
  function kpi(x,y,w,h,lbl,val,sub,hex){
    const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
    doc.setFillColor(238,243,251);doc.rect(x,y,w,h,"F");
    doc.setFillColor(r,g,b);doc.rect(x,y,1.2,h,"F");
    doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(100,116,139);
    doc.text(lbl.toUpperCase(),x+2,y+4.5);
    doc.setFontSize(12);doc.setFont("helvetica","bold");doc.setTextColor(r,g,b);
    doc.text(val,x+2,y+10.5);
    if(sub){doc.setFontSize(6);doc.setFont("helvetica","normal");doc.setTextColor(100,116,139);doc.text(sub,x+2,y+15);}
    doc.setTextColor(0,0,0);
  }
  function at(sy,head,body,cs){
    doc.autoTable({startY:sy,head:[head],body,
      styles:{fontSize:7,cellPadding:1.5},
      headStyles:{fillColor:[0,26,78],textColor:255,fontStyle:"bold",fontSize:7},
      alternateRowStyles:{fillColor:[238,243,251]},
      columnStyles:cs||{0:{fontStyle:"bold"}},
      margin:{left:7,right:7}});
    return doc.lastAutoTable.finalY;
  }
  const kW=65,kH=18,kY=22;

  // P1 Cover
  doc.setFillColor(0,26,78);doc.rect(0,0,W,210,"F");
  doc.setFillColor(0,48,135);doc.rect(0,118,W,92,"F");
  doc.setFillColor(228,0,43);doc.rect(0,117,W,2,"F");
  doc.setFillColor(228,0,43);doc.rect(9,9,28,10,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(9);doc.setFont("helvetica","bold");
  doc.text("NTT DATA",23,16,{align:"center"});
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);
  doc.text("GUIDEWIRE PRACTICE",41,15.5);
  doc.setTextColor(255,255,255);doc.setFontSize(28);doc.setFont("helvetica","bold");
  doc.text("Guidewire Cloud AMS",9,50);doc.text("Engagement Estimator",9,64);
  doc.setFontSize(10);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);
  doc.text("PC · CC · BC · Digital (Jutro) · Onsite / Offshore IN / Nearshore MX & MA · L2/L3 · AI-Augmented",9,79);
  doc.text("Coverage: "+serviceCoverage+"  |  L2 avg: "+avgHrsL2+"h  |  L3 avg: "+avgHrsL3+"h  |  "+ticketsPerMonth+" tickets/month  |  Contingency: "+contingency+"%",9,87);
  doc.setFontSize(11);doc.setTextColor(147,197,253);
  doc.text("3-Year Programme Cost (incl. "+contingency+"% contingency):",9,128);
  doc.setFontSize(22);doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
  doc.text(sym+(totalProgramCost/1000000).toFixed(2)+"M",9,141);
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);
  doc.text(mods.length+" modules · "+intgs.length+" integrations · "+sym+teamRate+"/hr blended · KT: "+ktMonths+"mo · Cal: "+calMonths+"mo",9,150);
  // Client banner on cover
  if(clientName){
    doc.setFillColor(0,0,0);doc.setGState&&doc.setGState(doc.GState({opacity:0.3}));
    doc.rect(0,155,W,28,"F");
    doc.setGState&&doc.setGState(doc.GState({opacity:1}));
    doc.setFillColor(0,48,135);doc.setGState&&doc.setGState(doc.GState({opacity:0.6}));
    doc.rect(0,155,W,28,"F");
    doc.setGState&&doc.setGState(doc.GState({opacity:1}));
    doc.setTextColor(252,211,77);doc.setFontSize(9);doc.setFont("helvetica","bold");
    doc.text("PREPARED FOR",9,163);
    doc.setFontSize(18);doc.text(clientName,9,174);
    if(clientCity){doc.setFontSize(11);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);doc.text(clientCity,9,181);}
    if(engagementRef){doc.setFontSize(8);doc.setTextColor(147,197,253);doc.text("Reference: "+engagementRef,W-9,181,{align:"right"});}
  }
  if(deliveryLocDetails&&deliveryLocDetails.length>0){
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(147,197,253);
    doc.text("Delivery Centres: "+deliveryLocDetails.map(d=>d.label).join("  ·  "),9,clientName?188:158);
  }
  doc.setFontSize(7);doc.setTextColor(100,116,139);
  doc.text("NTT DATA — Guidewire Practice  |  Confidential  |  "+new Date().getFullYear(),W/2,206,{align:"center"});

  // P2 Team & Locations
  const clientSubtitle=clientName?(clientName+(clientCity?" — "+clientCity:"")+(engagementRef?"  |  "+engagementRef:"")):"";
  doc.addPage();ph("Team Model — Location Split & Rates",(clientSubtitle||"Blended rate: "+sym+teamRate+"/hr")+"  |  FTEs: "+totalFTE,2);
  kpi(7,  kY,kW,kH,"Total FTEs",String(totalFTE),"Steady-state baseline","003087");
  kpi(75, kY,kW,kH,"KT Phase FTEs",String(Math.round(ktHrs/FTE_HRS*10)/10),"Months 1-"+ktMonths,"D97706");
  kpi(143,kY,kW,kH,"SS FTEs",String(Math.round(ssHrs/FTE_HRS*10)/10),"Post-calibration","0A7C59");
  kpi(211,kY,kW,kH,"Contingency",contingency+"%",sym+(contingencyAmt/1000).toFixed(0)+"K total","C2410C");
  at(47,["Location","Country","Split %","FTEs","Rate/hr","Annual Hrs","Annual Cost"],
    [...locations.map(loc=>[loc.flag+" "+loc.label,loc.country,locSplit[loc.key]+"%",locFTEs[loc.key],sym+rates[loc.key],Math.round(locFTEs[loc.key]*FTE_HRS).toLocaleString(),sym+Math.round(locFTEs[loc.key]*rates[loc.key]*FTE_HRS/1000)+"K"]),
     ["TOTAL","","100%",totalFTE,sym+teamRate+" blended",(totalFTE*FTE_HRS).toLocaleString(),sym+Math.round(totalFTE*teamRate*FTE_HRS/1000)+"K"]]);
  const roleY=doc.lastAutoTable.finalY+5;
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(0,48,135);
  doc.text("Role-Based FTE Distribution",7,roleY);doc.setTextColor(0,0,0);
  at(roleY+3,["Role","Hrs/yr","FTEs","Onsite","Offshore IN","Nearshore MX","Nearshore MA"],
    roles.map(r=>[r.label,r.hrs.toLocaleString(),r.fte,
      Math.round(r.fte*(locSplit.onsite/100)*10)/10,
      Math.round(r.fte*(locSplit.offshore/100)*10)/10,
      Math.round(r.fte*(locSplit.nearshoreM/100)*10)/10,
      Math.round(r.fte*(locSplit.nearshoreMO/100)*10)/10]));

  // P3 Phase Split KT vs SS
  doc.addPage();ph("KT vs Steady-State Phase Split","KT overhead: 40%  |  SLA live Month "+(ktMonths+calMonths+1),3);
  kpi(7,  kY,kW,kH,"KT Hrs",ktHrs.toLocaleString(),sym+Math.round(ktHrs*teamRate*(1+contingency/100)/1000)+"K","D97706");
  kpi(75, kY,kW,kH,"Calibration Hrs",calHrs.toLocaleString(),sym+Math.round(calHrs*teamRate*(1+contingency/100)/1000)+"K","0891B2");
  kpi(143,kY,kW,kH,"SS Y1 Hrs",ssHrs.toLocaleString(),sym+Math.round(ssHrs*teamRate*(1+contingency/100)/1000)+"K","0A7C59");
  kpi(211,kY,kW,kH,"3-Yr Total",sym+(totalProgramCost/1000000).toFixed(2)+"M","Base "+sym+(totalRaw/1000000).toFixed(2)+"M","E4002B");
  at(47,["Phase","Period","Hrs","FTEs","Base Cost","w/ Contingency","Note"],[
    ["KT / Mobilisation","Months 1-"+ktMonths,ktHrs.toLocaleString(),Math.round(ktHrs/FTE_HRS*10)/10,sym+Math.round(ktHrs*teamRate/1000)+"K",sym+Math.round(ktHrs*teamRate*(1+contingency/100)/1000)+"K","40% overhead — shadowing & docs"],
    ["Calibration","Months "+(ktMonths+1)+"-"+(ktMonths+calMonths),calHrs.toLocaleString(),(calHrs/FTE_HRS).toFixed(1),sym+Math.round(calHrs*teamRate/1000)+"K",sym+Math.round(calHrs*teamRate*(1+contingency/100)/1000)+"K","No SLA penalties"],
    ["Steady-State Y1","Months "+(ktMonths+calMonths+1)+"-12",ssHrs.toLocaleString(),Math.round(ssHrs/FTE_HRS*10)/10,sym+Math.round(ssHrs*teamRate/1000)+"K",sym+Math.round(ssHrs*teamRate*(1+contingency/100)/1000)+"K","SLA active"],
    ["Steady-State Y2","Months 13-24",annual[1].hrs.toLocaleString(),(annual[1].hrs/FTE_HRS).toFixed(1),sym+(annual[1].raw/1000).toFixed(0)+"K",sym+(annual[1].cost/1000).toFixed(0)+"K","AI savings 18%"],
    ["Steady-State Y3","Months 25-36",annual[2].hrs.toLocaleString(),(annual[2].hrs/FTE_HRS).toFixed(1),sym+(annual[2].raw/1000).toFixed(0)+"K",sym+(annual[2].cost/1000).toFixed(0)+"K","AI savings 28%"],
  ]);
  const locPhY=doc.lastAutoTable.finalY+5;
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(0,48,135);
  doc.text("Location FTE Split by Phase",7,locPhY);doc.setTextColor(0,0,0);
  at(locPhY+3,["Location","KT FTEs","KT Cost","Cal FTEs","SS Y1 FTEs","SS Y1 Cost","Y2 FTEs","Y3 FTEs"],
    locations.map(loc=>{const pct=locSplit[loc.key]/100,r=rates[loc.key];
      return[loc.flag+" "+loc.label,Math.round(ktHrs/FTE_HRS*pct*10)/10,sym+Math.round(ktHrs/FTE_HRS*pct*r*FTE_HRS/1000)+"K",Math.round(calHrs/FTE_HRS*pct*10)/10,Math.round(ssHrs/FTE_HRS*pct*10)/10,sym+Math.round(ssHrs/FTE_HRS*pct*r*FTE_HRS/1000)+"K",Math.round(annual[1].hrs/FTE_HRS*pct*10)/10,Math.round(annual[2].hrs/FTE_HRS*pct*10)/10];}));

  // P4 3-Year Cost
  doc.addPage();ph("3-Year Cost & Effort Summary","AI: 8%→18%→28%  |  "+contingency+"% contingency applied  |  "+serviceCoverage,4);
  kpi(7,  kY,kW,kH,"Year 1",sym+(annual[0].cost/1000).toFixed(0)+"K",annual[0].hrs.toLocaleString()+" hrs","003087");
  kpi(75, kY,kW,kH,"Year 2",sym+(annual[1].cost/1000).toFixed(0)+"K",annual[1].hrs.toLocaleString()+" hrs","0891B2");
  kpi(143,kY,kW,kH,"Year 3",sym+(annual[2].cost/1000).toFixed(0)+"K",annual[2].hrs.toLocaleString()+" hrs","0A7C59");
  kpi(211,kY,kW,kH,"3-Yr Total",sym+(totalProgramCost/1000000).toFixed(2)+"M","Cont: "+sym+(contingencyAmt/1000).toFixed(0)+"K","E4002B");
  at(47,["Stream","Y1 Hrs","Y1 Base","Y1 w/Cont","Y2 Hrs","Y2 w/Cont","Y3 Hrs","Y3 w/Cont"],[
    ["L2 Incident Mgmt",annual[0].l2.toLocaleString(),sym+Math.round(annual[0].l2*teamRate/1000)+"K",sym+Math.round(annual[0].l2*teamRate*(1+contingency/100)/1000)+"K",annual[1].l2.toLocaleString(),sym+Math.round(annual[1].l2*teamRate*(1+contingency/100)/1000)+"K",annual[2].l2.toLocaleString(),sym+Math.round(annual[2].l2*teamRate*(1+contingency/100)/1000)+"K"],
    ["L3 Problem Mgmt", annual[0].l3.toLocaleString(),sym+Math.round(annual[0].l3*teamRate/1000)+"K",sym+Math.round(annual[0].l3*teamRate*(1+contingency/100)/1000)+"K",annual[1].l3.toLocaleString(),sym+Math.round(annual[1].l3*teamRate*(1+contingency/100)/1000)+"K",annual[2].l3.toLocaleString(),sym+Math.round(annual[2].l3*teamRate*(1+contingency/100)/1000)+"K"],
    ["Enhancements",    annual[0].enh.toLocaleString(),sym+Math.round(annual[0].enh*teamRate/1000)+"K",sym+Math.round(annual[0].enh*teamRate*(1+contingency/100)/1000)+"K",annual[1].enh.toLocaleString(),sym+Math.round(annual[1].enh*teamRate*(1+contingency/100)/1000)+"K",annual[2].enh.toLocaleString(),sym+Math.round(annual[2].enh*teamRate*(1+contingency/100)/1000)+"K"],
    ["Integration AMS", annual[0].intg.toLocaleString(),sym+Math.round(annual[0].intg*teamRate/1000)+"K",sym+Math.round(annual[0].intg*teamRate*(1+contingency/100)/1000)+"K",annual[1].intg.toLocaleString(),sym+Math.round(annual[1].intg*teamRate*(1+contingency/100)/1000)+"K",annual[2].intg.toLocaleString(),sym+Math.round(annual[2].intg*teamRate*(1+contingency/100)/1000)+"K"],
    ["TOTAL",annual[0].hrs.toLocaleString(),sym+(annual[0].raw/1000).toFixed(0)+"K",sym+(annual[0].cost/1000).toFixed(0)+"K",annual[1].hrs.toLocaleString(),sym+(annual[1].cost/1000).toFixed(0)+"K",annual[2].hrs.toLocaleString(),sym+(annual[2].cost/1000).toFixed(0)+"K"],
  ]);

  // P5 SLA
  doc.addPage();ph("SLA Framework & Credit/Penalty Model","Live Month "+(ktMonths+calMonths+1)+"  |  Coverage: "+serviceCoverage,5);
  at(22,["Priority","Definition","Response","Resolution","Penalty/Breach","Credit Cap"],[
    ["P1 - Critical","GW prod down / major business impact","15 min","4 hrs","5% monthly fee","15%"],
    ["P2 - High","Significant impairment, workaround exists","30 min","8 hrs","2% monthly fee","10%"],
    ["P3 - Medium","Non-critical, limited user impact","2 hrs","24 hrs","1% monthly fee","5%"],
    ["P4 - Low","Cosmetic / informational","4 hrs","72 hrs","0.5% monthly fee","2%"],
  ]);
  const sy=doc.lastAutoTable.finalY+4;
  doc.setFillColor(255,247,237);doc.rect(7,sy,W-14,13,"F");
  doc.setFontSize(7.5);doc.setFont("helvetica","normal");doc.setTextColor(45,55,72);
  doc.text("Credits from Month "+(ktMonths+calMonths+1)+". Max: 25% monthly fee. Exclusions: GW Cloud outages, client delays, freeze. Incentive: >98% x3mo = 1% reduction.",10,sy+7,{maxWidth:W-20});
  doc.setTextColor(0,0,0);
  const iy=sy+19;
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(0,48,135);
  doc.text("Integration SLA Addendum",7,iy);doc.setTextColor(0,0,0);
  at(iy+3,["Integration","Monitoring","Alert SLA","Fix SLA (P2)","Escalation"],
    intgs.map(i=>[i,"24x7 automated","15 min","8 hrs","GW + Vendor bridge"]));

  // P6 AI
  doc.addPage();ph("AI Capabilities Roadmap","Augmenting all AMS layers",6);
  kpi(7,  kY,kW,kH,"Y1 AI Gain","8%","Auto-triage & copilot","0891B2");
  kpi(75, kY,kW,kH,"Y2 AI Gain","18%","Predictive ops","0A7C59");
  kpi(143,kY,kW,kH,"Y3 AI Gain","28%","Autonomous L2","6D28D9");
  kpi(211,kY,kW,kH,"3-Yr Hrs Saved",(totalBaseHrs*3-annual.reduce((s,a)=>s+a.hrs,0)).toLocaleString(),"vs. no-AI","003087");
  at(47,["Accelerator","Timeline","Impact","Benefit"],[
    ["GW Incident Auto-Triage","Y1 Q1","High","Triage 30min→<5min. Routes; suggests resolution."],
    ["Gosu Code Copilot","Y1 Q2","High","Real-time Gosu suggestions, anti-pattern detection, unit tests."],
    ["Incident Predictor","Y1 Q3","Medium","ML predicts spikes; pre-scales team capacity."],
    ["AI Release Notes Summariser","Y1 Q4","Medium","Processes GW releases; saves ~16 hrs/cycle."],
    ["GW Test DataHub AI","Y2 Q1","High","GDPR-safe test data generation. UAT setup -60%."],
    ["Autonomous L2 Agent","Y3 Q1","Transformational","30-40% of L2 resolved autonomously via runbooks."],
  ],{0:{fontStyle:"bold",cellWidth:60},1:{cellWidth:20},2:{cellWidth:25}});

  // P7 KT Plan
  doc.addPage();ph("Knowledge Transition Plan",ktMonths+"-month KT + "+calMonths+"-month calibration  |  SLA live Month "+(ktMonths+calMonths+1),7);
  at(22,["Phase","Month","Key Activities","Deliverable"],[
    ["Discovery & Shadow","Month 1","Onboard all locations (Onsite+Offshore IN+Nearshore MX+MA); shadow incumbent; map "+intgs.length+" integrations.","Discovery Report, Knowledge Gap Analysis"],
    ["Runbook Creation","Month 2","Author runbooks for top 50 patterns; Gosu walkthrough; first NTT DATA-led resolutions.","50 Runbooks, Integration Playbooks"],
    ["Primary Ownership","Month 3","NTT DATA takes ownership; first sprint delivered; KT assessment.","KT Certificate, Runbook Library"],
  ].slice(0,ktMonths),{0:{fontStyle:"bold",cellWidth:48},1:{cellWidth:18}});
  const ry=doc.lastAutoTable.finalY+5;
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(0,48,135);
  doc.text("KT Risk Register",7,ry);doc.setTextColor(0,0,0);
  at(ry+3,["Risk","Likelihood","Impact","Mitigation"],[
    ["Incumbent SI non-cooperation","Medium","High","Contractual KT obligations; weekly progress reviews"],
    ["Gosu code undocumented","High","High","Code archaeology; Gosu Copilot assists discovery"],
    ["Integration access delays","Medium","Medium","Early access; parallel provisioning Month 1"],
    ["Volume underestimate","Medium","Medium","30% calibration buffer; agree true-up mechanism"],
    ["Offshore/nearshore ramp delay","Medium","Medium","2-week pre-boarding; local leads hired before go-live"],
    ["Key resource attrition","Low","High","2x coverage per role; docs prevent single-dependency"],
  ],{0:{fontStyle:"bold",cellWidth:60},1:{cellWidth:22},2:{cellWidth:18}});

  doc.save("NTT-DATA-GW-AMS-Estimator.pdf");
}
