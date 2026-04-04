import { useState } from "react";
import { useEngagement } from "./useEngagement";
import { exportToPptx, exportToPdf } from "./exportUtils";

const C = {
  blue:"#003087",red:"#E4002B",navy:"#001A4E",gray:"#F4F6FA",
  darkGray:"#2D3748",mid:"#64748B",white:"#FFFFFF",green:"#0A7C59",
  amber:"#D97706",teal:"#0891B2",purple:"#6D28D9",orange:"#C2410C",
};

const MODULES = ["PolicyCenter (PC)","ClaimCenter (CC)","BillingCenter (BC)","Digital - Jutro"];
const INTEGRATIONS = ["Policy Data Service","Payment Gateway","FNOL / Third-Party Claims","Document Management (DocuSign)","External Rating Engine","BI / Analytics (Snowflake)"];

const COVERAGE_OPTIONS = [
  {label:"Normal Business Hours (8x5)",key:"8x5", annualHrs:2080,desc:"Mon-Fri 8am-6pm local"},
  {label:"Extended Hours (12x5)",      key:"12x5",annualHrs:3120,desc:"Mon-Fri 7am-7pm local"},
  {label:"Extended + Weekend (12x7)",  key:"12x7",annualHrs:4368,desc:"Mon-Sun 7am-7pm"},
  {label:"24x7 Full Managed Service",  key:"24x7",annualHrs:8760,desc:"Round-the-clock coverage"},
];

// Location definitions with colour coding
const LOCATIONS = [
  {key:"onsite",  label:"Onsite",       flag:"🏢", country:"Client Site",   defaultRate:145, color:"#1E3A5F"},
  {key:"offshore",label:"Offshore",     flag:"🇮🇳", country:"India",         defaultRate:45,  color:"#FF9933"},
  {key:"nearshoreM",label:"Nearshore MX",flag:"🇲🇽",country:"Mexico",        defaultRate:75,  color:"#006847"},
  {key:"nearshoreMO",label:"Nearshore MA",flag:"🇲🇦",country:"Morocco",       defaultRate:65,  color:"#C1272D"},
];

// Client geography options
const CLIENT_LOCATIONS = [
  {region:"North America",cities:["New York, USA","Chicago, USA","Dallas, USA","Toronto, Canada","Mexico City, Mexico"]},
  {region:"Europe",cities:["London, UK","Paris, France","Frankfurt, Germany","Madrid, Spain","Amsterdam, Netherlands","Zurich, Switzerland"]},
  {region:"Middle East & Africa",cities:["Dubai, UAE","Riyadh, Saudi Arabia","Casablanca, Morocco","Johannesburg, South Africa"]},
  {region:"Asia Pacific",cities:["Singapore","Sydney, Australia","Tokyo, Japan","Mumbai, India","Hong Kong"]},
  {region:"Latin America",cities:["São Paulo, Brazil","Buenos Aires, Argentina","Bogotá, Colombia"]},
];

// NTT DATA delivery centre options
const DELIVERY_LOCATIONS = [
  {key:"bangalore",  label:"Bangalore, India",    flag:"🇮🇳", timezone:"IST (UTC+5:30)"},
  {key:"hyderabad",  label:"Hyderabad, India",    flag:"🇮🇳", timezone:"IST (UTC+5:30)"},
  {key:"chennai",    label:"Chennai, India",      flag:"🇮🇳", timezone:"IST (UTC+5:30)"},
  {key:"cdmx",       label:"Mexico City, Mexico", flag:"🇲🇽", timezone:"CST (UTC-6)"},
  {key:"monterrey",  label:"Monterrey, Mexico",   flag:"🇲🇽", timezone:"CST (UTC-6)"},
  {key:"casablanca", label:"Casablanca, Morocco", flag:"🇲🇦", timezone:"WET (UTC+1)"},
  {key:"rabat",      label:"Rabat, Morocco",      flag:"🇲🇦", timezone:"WET (UTC+1)"},
  {key:"london",     label:"London, UK",          flag:"🇬🇧", timezone:"GMT (UTC+0)"},
  {key:"dallas",     label:"Dallas, USA",         flag:"🇺🇸", timezone:"CST (UTC-6)"},
  {key:"sydney",     label:"Sydney, Australia",   flag:"🇦🇺", timezone:"AEST (UTC+10)"},
];

// Role families used in AMS
const ROLES = [
  {key:"lead",     label:"AMS Lead / Architect",      l2:0, l3:0.15, enh:0.10, kt:0.20},
  {key:"l2eng",    label:"L2 Support Engineer",        l2:0.55, l3:0,    enh:0,    kt:0.25},
  {key:"l3eng",    label:"L3 Gosu / Dev Engineer",     l2:0,    l3:0.60, enh:0.30, kt:0.20},
  {key:"ba",       label:"Business Analyst",           l2:0,    l3:0,    enh:0.30, kt:0.15},
  {key:"qa",       label:"QA / Test Engineer",         l2:0,    l3:0,    enh:0.20, kt:0.10},
  {key:"intg",     label:"Integration Engineer",       l2:0.25, l3:0.15, enh:0.10, kt:0.10},
  {key:"sdm",      label:"Service Delivery Manager",   l2:0.20, l3:0.10, enh:0,    kt:0},
];

const BASE_INC = {
  L2:{PC:180,CC:150,BC:90,Digital:60},
  L3:{PC:60, CC:50, BC:30,Digital:20},
};
const FTE_HRS = 1760;
const SP_HRS  = 6.8;
const AI_GAINS= {Y1:0.08,Y2:0.18,Y3:0.28};

// KT-phase overhead: additional effort on top of steady-state
const KT_OVERHEAD = 0.40; // 40% extra during KT months for shadowing/documentation

function getKey(mod){
  if(mod.includes("PC"))return"PC";
  if(mod.includes("CC"))return"CC";
  if(mod.includes("BC"))return"BC";
  return"Digital";
}

function calcAnnualEffort(mods,spPS,sprsYr,avgL2,avgL3,tktMo){
  const res={};let tL2=0,tL3=0;
  const defTot=Object.values(BASE_INC.L2).reduce((s,v)=>s+v,0)+Object.values(BASE_INC.L3).reduce((s,v)=>s+v,0);
  const sf=(tktMo*12)/(defTot*12);
  mods.forEach(mod=>{
    const k=getKey(mod);
    const l2v=Math.round(BASE_INC.L2[k]*sf*12),l3v=Math.round(BASE_INC.L3[k]*sf*12);
    const l2h=Math.round(l2v*avgL2),l3h=Math.round(l3v*avgL3);
    res[mod]={l2hrs:l2h,l3hrs:l3h,l2vol:l2v,l3vol:l3v};
    tL2+=l2h;tL3+=l3h;
  });
  return{byModule:res,totalL2:tL2,totalL3:tL3,totalEnhancement:Math.round(spPS*sprsYr*SP_HRS)};
}

function applyAI(hrs,yr){return Math.round(hrs*(1-[0,AI_GAINS.Y1,AI_GAINS.Y2,AI_GAINS.Y3][yr]));}

// Compute FTE split across locations for a given total FTE count
function splitFTEs(totalFTE, locationSplit){
  const out={};
  LOCATIONS.forEach(loc=>{out[loc.key]=Math.round(totalFTE*(locationSplit[loc.key]/100)*10)/10;});
  return out;
}

// Compute blended rate from location split and individual rates
function blendedRate(locationSplit, rates){
  return LOCATIONS.reduce((s,loc)=>s+(locationSplit[loc.key]/100)*rates[loc.key],0);
}

// Per-role FTE distribution based on total hours
function roleBreakdown(totalL2,totalL3,totalEnh,totalIntg){
  const totalHrs=totalL2+totalL3+totalEnh+totalIntg;
  return ROLES.map(r=>{
    const hrs=totalL2*r.l2+totalL3*r.l3+totalEnh*r.enh+totalIntg*(r.key==="intg"?0.5:r.key==="sdm"?0.1:0);
    return{...r,hrs:Math.round(hrs),fte:Math.round(hrs/FTE_HRS*10)/10};
  }).filter(r=>r.hrs>0);
}

// ── UI Helpers ─────────────────────────────────────────────────────────────────
function Section({title,icon,children,accent}){
  // Pre-computed display strings — avoids any JSX prop concatenation issues
  const dBlended     = sym + blended + "/hr";
  const dContAmt     = sym + (contingencyAmt/1000).toFixed(0) + "K";
  const dTotCost     = sym + (totalCost/1000000).toFixed(2) + "M";
  const dKtLabel     = "KT Phase (" + ktMo + " mo)";
  const dCalLabel    = "Calibration (" + calMo + " mo)";
  const dSsLabel     = "Steady-State (Yr1 rem.)";
  const dKtSub       = sym + Math.round(ktHrs*blended*(1+contingency/100)/1000) + "K · " + ktFTE + " FTEs";
  const dCalSub      = sym + Math.round(calHrs*blended*(1+contingency/100)/1000) + "K";
  const dSsSub       = sym + Math.round(ssHrs*blended*(1+contingency/100)/1000) + "K · " + ssFTE + " FTEs";
  const dSpSub       = sprsYr + " sprints x " + spPS + " SP";
  const dIntgSub     = intgs.length + " integ x 60 hrs";
  const dContPct     = contingency + "%";
  const dContSub3yr  = contingency + "% contingency = " + sym + (contingencyAmt/1000).toFixed(0) + "K";
  const dContSubTot  = sym + (contingencyAmt/1000).toFixed(0) + "K total";
  const dAISaved     = (totalBaseHrs*3 - annual.reduce((s,a)=>s+a.hrs,0)).toLocaleString();
  const dKtMoSub     = "Months 1-" + ktMo + " incl. overhead";

  return(
    <div style={{background:C.white,borderRadius:12,border:"1px solid #E2E8F0",marginBottom:24,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,48,135,0.07)"}}>
      <div style={{background:accent||C.blue,padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>{icon}</span>
        <span style={{color:C.white,fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:15}}>{title}</span>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );
}
function Badge({label,color}){
  return<span style={{background:color+"18",color,border:"1px solid "+color+"40",borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700,fontFamily:"'Barlow',sans-serif"}}>{label}</span>;
}
function KPI({label,value,sub,color}){
  return(
    <div style={{background:C.gray,borderRadius:10,padding:"14px 16px",borderLeft:"4px solid "+(color||C.blue),flex:1,minWidth:130}}>
      <div style={{fontSize:10,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:color||C.blue,fontFamily:"'Barlow Condensed',sans-serif"}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:C.mid,marginTop:2}}>{sub}</div>}
    </div>
  );
}
function DT({headers,rows,compact,highlight}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:compact?11:12.5,fontFamily:"'Barlow',sans-serif"}}>
        <thead><tr>{headers.map((h,i)=>(
          <th key={i} style={{background:C.navy,color:C.white,padding:compact?"7px 10px":"9px 12px",textAlign:i===0?"left":"center",fontWeight:700,fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
        ))}</tr></thead>
        <tbody>{rows.map((row,ri)=>(
          <tr key={ri} style={{background:highlight&&ri===rows.length-1?"#EEF3FB":ri%2===0?C.white:C.gray}}>
            {row.map((cell,ci)=>(
              <td key={ci} style={{padding:compact?"6px 10px":"8px 12px",textAlign:ci===0?"left":"center",borderBottom:"1px solid #E2E8F0",fontWeight:(ci===0||highlight&&ri===rows.length-1)?700:400,color:C.darkGray}}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function Slider({label,min,max,value,onChange,step,unit,hint}){
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <div><span style={{fontSize:11,color:C.mid}}>{label}</span>{hint&&<span style={{fontSize:9,color:"#A0AEC0",marginLeft:5}}>{hint}</span>}</div>
        <span style={{fontSize:12,fontWeight:700,color:C.blue,fontFamily:"'Barlow Condensed',sans-serif"}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step||1} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:C.blue,cursor:"pointer"}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#A0AEC0",marginTop:1}}><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
}
function NumInput({label,value,onChange,min,max,prefix,suffix}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10,color:C.mid,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        {prefix&&<span style={{fontSize:12,color:C.mid}}>{prefix}</span>}
        <input type="number" min={min} max={max} value={value}
          onChange={e=>onChange(Math.min(max||9999,Math.max(min||0,Number(e.target.value))))}
          style={{width:"100%",padding:"6px 10px",border:"1px solid #CBD5E0",borderRadius:6,fontSize:13,fontWeight:700,color:C.blue,fontFamily:"'Barlow Condensed',sans-serif",outline:"none"}}/>
        {suffix&&<span style={{fontSize:12,color:C.mid}}>{suffix}</span>}
      </div>
    </div>
  );
}

const TABS=[
  {id:"overview",label:"Scope & Config"},
  {id:"team",    label:"Team & Rates"},
  {id:"estimation",label:"Estimation"},
  {id:"phases",  label:"KT vs Steady-State"},
  {id:"roadmap", label:"3-Year Roadmap"},
  {id:"sla",     label:"SLA & Credits"},
  {id:"ai",      label:"AI Capabilities"},
  {id:"kt",      label:"KT Plan"},
];
const ICONS={overview:"📋",team:"👥",estimation:"📊",phases:"📅",roadmap:"🗓",sla:"⚖️",ai:"🤖",kt:"🔄"};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("overview");
  const eng=useEngagement();
  const[mods,setMods]=useState([...MODULES]);
  const[intgs,setIntgs]=useState(INTEGRATIONS.slice(0,5));
  const[sprsYr,setSprsYr]=useState(26);
  const[spPS,setSpPS]=useState(20);
  const[ktMo,setKtMo]=useState(3);
  const[calMo,setCalMo]=useState(3);
  const[cur,setCur]=useState("USD");
  const[avgL2,setAvgL2]=useState(4);
  const[avgL3,setAvgL3]=useState(12);
  const[tktMo,setTktMo]=useState(60);
  const[covKey,setCovKey]=useState("8x5");
  const[contingency,setContingency]=useState(10); // %
  const[exporting,setExporting]=useState(null);

  // Client details
  const[clientName,setClientName]=useState("");
  const[clientCity,setClientCity]=useState("");
  const[clientRegion,setClientRegion]=useState("Europe");
  const[deliveryLocs,setDeliveryLocs]=useState(["bangalore","casablanca","cdmx"]);
  const[engagementRef,setEngagementRef]=useState("");

  function toggleDelivery(key){
    setDeliveryLocs(p=>p.includes(key)?p.length>1?p.filter(x=>x!==key):p:[...p,key]);
  }

  // Location split (%) — must sum to 100
  const[locSplit,setLocSplit]=useState({onsite:15,offshore:55,nearshoreM:20,nearshoreMO:10});
  // Individual rates per location (USD/hr)
  const[rates,setRates]=useState(Object.fromEntries(LOCATIONS.map(l=>[l.key,l.defaultRate])));

  function updateLocSplit(key,val){
    const others=LOCATIONS.filter(l=>l.key!==key);
    const remaining=100-val;
    const currentOthers=others.reduce((s,l)=>s+locSplit[l.key],0);
    const newSplit={...locSplit,[key]:val};
    if(currentOthers>0){
      others.forEach(l=>{newSplit[l.key]=Math.round((locSplit[l.key]/currentOthers)*remaining);});
    } else {
      const eq=Math.floor(remaining/others.length);
      others.forEach((l,i)=>{newSplit[l.key]=i===others.length-1?remaining-eq*(others.length-1):eq;});
    }
    setLocSplit(newSplit);
  }
  function updateRate(key,val){setRates(r=>({...r,[key]:val}));}

  const sym=cur==="USD"?"$":"£";
  const coverage=COVERAGE_OPTIONS.find(c=>c.key===covKey)||COVERAGE_OPTIONS[0];
  const blended=Math.round(blendedRate(locSplit,rates));

  const toggleMod=m=>setMods(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m]);
  const toggleIntg=i=>setIntgs(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]);

  const base=calcAnnualEffort(mods,spPS,sprsYr,avgL2,avgL3,tktMo);
  const intgHrs=intgs.length*60;
  const totalBaseHrs=base.totalL2+base.totalL3+base.totalEnhancement+intgHrs;

  // Phase calculations
  // KT phase: ktMo months with overhead applied, split from annual
  const ktFraction=ktMo/12;
  const calFraction=calMo/12;
  const ssFraction=(12-ktMo-calMo)/12;

  const ktHrs=Math.round(totalBaseHrs*ktFraction*(1+KT_OVERHEAD));
  const calHrs=Math.round(totalBaseHrs*calFraction*1.10); // 10% extra during calibration
  const ssHrs=Math.round(totalBaseHrs*ssFraction);

  // Year 1 = KT + Cal + partial SS; Year 2,3 = full SS with AI gains
  const y1TotalHrs=ktHrs+calHrs+ssHrs;
  const annual=[1,2,3].map(y=>{
    const hrs=y===1?y1TotalHrs:applyAI(Math.round(totalBaseHrs),y);
    const raw=Math.round(hrs*blended);
    const withConting=Math.round(raw*(1+contingency/100));
    const l2=y===1?Math.round(base.totalL2*(1+ktFraction*KT_OVERHEAD)):applyAI(base.totalL2,y);
    const l3=y===1?Math.round(base.totalL3*(1+ktFraction*KT_OVERHEAD)):applyAI(base.totalL3,y);
    const enh=y===1?Math.round(base.totalEnhancement*ssFraction):applyAI(base.totalEnhancement,y);
    const intg=applyAI(intgHrs,y);
    return{y,hrs,l2,l3,enh,intg,raw,cost:withConting};
  });
  const totalRaw=annual.reduce((s,a)=>s+a.raw,0);
  const totalCost=annual.reduce((s,a)=>s+a.cost,0);
  const contingencyAmt=totalCost-totalRaw;

  const totalFTE=Math.round(totalBaseHrs/FTE_HRS*10)/10;
  const ktFTE=Math.round(ktHrs/FTE_HRS*10)/10;
  const ssFTE=Math.round(ssHrs/FTE_HRS*10)/10;
  const locFTEs=splitFTEs(totalFTE,locSplit);
  const roles=roleBreakdown(base.totalL2,base.totalL3,base.totalEnhancement,intgHrs);

  const exportData={
    selectedModules:mods,selectedIntegrations:intgs,
    spPerSprint:spPS,sprintsPerYear:sprsYr,teamRate:blended,
    ktMonths:ktMo,calMonths:calMo,currency:cur,
    clientName,clientCity,clientRegion,engagementRef,
    deliveryLocDetails:DELIVERY_LOCATIONS.filter(d=>deliveryLocs.includes(d.key)),
    serviceCoverage:coverage.label,avgHrsL2:avgL2,avgHrsL3:avgL3,ticketsPerMonth:tktMo,
    contingency,locSplit,rates,locations:LOCATIONS,
    base,annual,totalBaseHrs,integrationHrs:intgHrs,totalProgramCost:totalCost,
    totalRaw,contingencyAmt,ktHrs,calHrs,ssHrs,totalFTE,locFTEs,roles,
  };

  // ── Persistence: serialise all user state ──────────────────────────────────
  const appState={
    mods,intgs,sprsYr,spPS,ktMo,calMo,cur,avgL2,avgL3,tktMo,covKey,contingency,
    clientName,clientCity,clientRegion,deliveryLocs,engagementRef,locSplit,rates,
  };

  function restoreState(p){
    if(!p)return;
    if(p.mods)setMods(p.mods);
    if(p.intgs)setIntgs(p.intgs);
    if(p.sprsYr)setSprsYr(p.sprsYr);
    if(p.spPS)setSpPS(p.spPS);
    if(p.ktMo)setKtMo(p.ktMo);
    if(p.calMo)setCalMo(p.calMo);
    if(p.cur)setCur(p.cur);
    if(p.avgL2)setAvgL2(p.avgL2);
    if(p.avgL3)setAvgL3(p.avgL3);
    if(p.tktMo)setTktMo(p.tktMo);
    if(p.covKey)setCovKey(p.covKey);
    if(p.contingency!==undefined)setContingency(p.contingency);
    if(p.clientName!==undefined)setClientName(p.clientName);
    if(p.clientCity!==undefined)setClientCity(p.clientCity);
    if(p.clientRegion)setClientRegion(p.clientRegion);
    if(p.deliveryLocs)setDeliveryLocs(p.deliveryLocs);
    if(p.engagementRef!==undefined)setEngagementRef(p.engagementRef);
    if(p.locSplit)setLocSplit(p.locSplit);
    if(p.rs||p.rates)setRates(p.rs||p.rates);
  }

 // const eng=useEngagement();

  async function doExport(type){
    setExporting(type);
    try{type==="pptx"?await exportToPptx(exportData):await exportToPdf(exportData);}
    finally{setExporting(null);}
  }

  return(
    <div style={{fontFamily:"'Barlow',sans-serif",background:"#F0F4FA",minHeight:"100vh",color:C.darkGray}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#001A4E 0%,#003087 60%,#0057A8 100%)",padding:"20px 28px 16px",boxShadow:"0 4px 24px rgba(0,26,78,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:5}}>
              <div style={{background:C.red,color:C.white,padding:"3px 12px",borderRadius:4,fontWeight:800,fontSize:12,letterSpacing:"0.08em",fontFamily:"'Barlow Condensed',sans-serif"}}>NTT DATA</div>
              <div style={{color:"#93C5FD",fontSize:11,letterSpacing:"0.1em"}}>GUIDEWIRE PRACTICE</div>
            </div>
            <div style={{color:C.white,fontSize:20,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif"}}>Guidewire Cloud AMS — Engagement Estimator</div>
            {clientName&&<div style={{color:"#FCD34D",fontSize:13,fontWeight:700,marginTop:3,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>Client: {clientName}{clientCity?" | "+clientCity:""}</div>}
            <div style={{color:"#93C5FD",fontSize:11,marginTop:2}}>PC · CC · BC · Jutro · L2/L3 · Enhancements · Onsite/Offshore/Nearshore · 3-Year AI-Augmented Plan</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#93C5FD",fontSize:10,marginBottom:1}}>3-Year Programme Cost (incl. {contingency}% contingency)</div>
            <div style={{color:C.white,fontSize:28,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif"}}>{sym}{(totalCost/1000000).toFixed(2)}M</div>
            <div style={{color:"#93C5FD",fontSize:10,marginTop:1}}>Blended: {sym}{blended}/hr · {totalFTE} FTEs · {mods.length} modules</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:C.white,borderBottom:"3px solid "+C.blue,display:"flex",overflowX:"auto",boxShadow:"0 2px 8px rgba(0,48,135,0.08)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 16px",border:"none",cursor:"pointer",background:tab===t.id?C.blue:"transparent",color:tab===t.id?C.white:C.mid,fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,letterSpacing:"0.04em",whiteSpace:"nowrap",borderBottom:tab===t.id?"3px solid "+C.red:"3px solid transparent",transition:"all 0.2s"}}>
            {ICONS[t.id]} {t.label}
          </button>
        ))}
      </div>

            {/* Persistence + Export bar */}
      <div style={{background:C.white,borderBottom:"1px solid #E2E8F0",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <input value={eng.engagementName} onChange={e=>eng.setEngagementName(e.target.value)} placeholder="Engagement name..." style={{padding:"5px 10px",border:"1px solid #CBD5E0",borderRadius:6,fontSize:11,fontWeight:600,color:C.navy,outline:"none",minWidth:180}}/>
          <button onClick={()=>eng.save(appState)} style={{padding:"5px 14px",borderRadius:6,border:"2px solid "+C.green,background:eng.saveStatus==="saved"?C.green:C.white,color:eng.saveStatus==="saved"?C.white:C.green,fontWeight:700,fontSize:11,cursor:"pointer"}}>{eng.isSaving?"Saving...":eng.saveStatus==="saved"?"Saved":eng.saveStatus==="error"?"Error":"Save"}</button>
          <button onClick={()=>eng.loadList()} style={{padding:"5px 14px",borderRadius:6,border:"2px solid "+C.teal,background:eng.isLoading?C.teal:C.white,color:eng.isLoading?C.white:C.teal,fontWeight:700,fontSize:11,cursor:"pointer"}}>{eng.isLoading?"Loading...":"Load"}</button>
          <button onClick={eng.newEngagement} style={{padding:"5px 14px",borderRadius:6,border:"2px solid #CBD5E0",background:C.white,color:C.mid,fontWeight:700,fontSize:11,cursor:"pointer"}}>New</button>
          {eng.engagementId&&(<span style={{fontSize:10,color:C.mid}}>{"ID: "+eng.engagementId}</span>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,color:C.mid}}>Export:</span>
          <button onClick={()=>doExport("pdf")} style={{padding:"5px 14px",borderRadius:6,border:"2px solid "+C.red,background:exporting==="pdf"?C.red:C.white,color:exporting==="pdf"?C.white:C.red,fontWeight:700,fontSize:11,cursor:"pointer"}}>{exporting==="pdf"?"Generating...":"PDF"}</button>
          <button onClick={()=>doExport("pptx")} style={{padding:"5px 14px",borderRadius:6,border:"2px solid "+C.blue,background:exporting==="pptx"?C.blue:C.white,color:exporting==="pptx"?C.white:C.blue,fontWeight:700,fontSize:11,cursor:"pointer"}}>{exporting==="pptx"?"Generating...":"PPTX"}</button>
        </div>
      </div>
      {eng.showList&&(<div style={{background:C.navy,color:C.white,padding:"16px 20px",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:700,fontSize:13}}>Saved Engagements</div>
          <button onClick={()=>eng.setShowList(false)} style={{background:"none",border:"none",color:"#93C5FD",cursor:"pointer",fontSize:16,padding:"0 4px"}}>X</button>
        </div>
        {eng.savedList.length===0?(<div style={{color:"#93C5FD",fontSize:11}}>No saved engagements yet. Click Save to store your current configuration.</div>):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
            {eng.savedList.map(e=>(
              <div key={e.id} style={{background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:12,color:C.white}}>{e.name}</div>
                  {e.client_name&&(<div style={{fontSize:10,color:"#FCD34D"}}>{e.client_name}{e.client_city?(" | "+e.client_city):""}</div>)}
                  <div style={{fontSize:9,color:"#93C5FD",marginTop:2}}>{new Date(e.updated_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>eng.loadOne(e.id).then(p=>restoreState(p))} style={{padding:"4px 12px",borderRadius:5,border:"1px solid #93C5FD",background:"transparent",color:"#93C5FD",fontWeight:700,fontSize:10,cursor:"pointer"}}>Load</button>
                  <button onClick={()=>eng.deleteOne(e.id)} style={{padding:"4px 10px",borderRadius:5,border:"1px solid "+C.red,background:"transparent",color:C.red,fontWeight:700,fontSize:10,cursor:"pointer"}}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)}

      {/* Content */}
      <div style={{maxWidth:1140,margin:"0 auto",padding:"24px 16px"}}>

        {/* ── SCOPE & CONFIG ── */}
        {tab==="overview"&&(<>
          <Section title="Client & Engagement Details" icon="🏛️" accent={C.navy}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Client Information</div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:C.mid,marginBottom:4}}>CLIENT NAME</div>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e=>setClientName(e.target.value)}
                    placeholder="e.g. Zurich Insurance Group"
                    style={{width:"100%",padding:"9px 12px",border:"2px solid "+(clientName?"#003087":"#CBD5E0"),borderRadius:8,fontSize:14,fontWeight:700,color:C.navy,fontFamily:"'Barlow',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
                  />
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:C.mid,marginBottom:4}}>ENGAGEMENT / OPPORTUNITY REFERENCE</div>
                  <input
                    type="text"
                    value={engagementRef}
                    onChange={e=>setEngagementRef(e.target.value)}
                    placeholder="e.g. OPP-2025-GW-AMS-001"
                    style={{width:"100%",padding:"8px 12px",border:"1px solid #CBD5E0",borderRadius:8,fontSize:13,color:C.darkGray,fontFamily:"'Barlow',sans-serif",outline:"none",boxSizing:"border-box"}}
                  />
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:C.mid,marginBottom:4}}>CLIENT REGION</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {CLIENT_LOCATIONS.map(r=>(
                      <button key={r.region} onClick={()=>{setClientRegion(r.region);setClientCity("");}}
                        style={{padding:"5px 12px",borderRadius:6,border:"2px solid "+(clientRegion===r.region?C.blue:"#CBD5E0"),background:clientRegion===r.region?C.blue:"white",color:clientRegion===r.region?"white":C.mid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow',sans-serif",transition:"all 0.15s"}}>
                        {r.region}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:C.mid,marginBottom:4}}>CLIENT CITY / LOCATION</div>
                  <select
                    value={clientCity}
                    onChange={e=>setClientCity(e.target.value)}
                    style={{width:"100%",padding:"8px 12px",border:"1px solid #CBD5E0",borderRadius:8,fontSize:13,color:C.darkGray,fontFamily:"'Barlow',sans-serif",outline:"none",background:"white",cursor:"pointer"}}>
                    <option value="">Select city...</option>
                    {(CLIENT_LOCATIONS.find(r=>r.region===clientRegion)||CLIENT_LOCATIONS[0]).cities.map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom">Other (type below)</option>
                  </select>
                  {clientCity==="__custom"&&(
                    <input type="text" placeholder="Enter city, country" onChange={e=>setClientCity(e.target.value)}
                      style={{width:"100%",padding:"8px 12px",border:"1px solid #CBD5E0",borderRadius:8,fontSize:13,color:C.darkGray,fontFamily:"'Barlow',sans-serif",outline:"none",marginTop:6,boxSizing:"border-box"}}/>
                  )}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>NTT DATA Delivery Centres</div>
                <div style={{fontSize:11,color:C.mid,marginBottom:12}}>Select all delivery locations providing this service:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {DELIVERY_LOCATIONS.map(dl=>{
                    const active=deliveryLocs.includes(dl.key);
                    return(
                      <button key={dl.key} onClick={()=>toggleDelivery(dl.key)}
                        style={{padding:"10px 12px",borderRadius:8,border:"2px solid "+(active?C.blue:"#CBD5E0"),background:active?C.blue+"0F":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:16}}>{dl.flag}</span>
                          <span style={{fontSize:12,fontWeight:700,color:active?C.blue:C.darkGray,fontFamily:"'Barlow',sans-serif"}}>{dl.label}</span>
                        </div>
                        <div style={{fontSize:10,color:C.mid,paddingLeft:22}}>{dl.timezone}</div>
                        {active&&<div style={{marginTop:4,paddingLeft:22,display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}></div>
                          <span style={{fontSize:9,color:C.green,fontWeight:700}}>SELECTED</span>
                        </div>}
                      </button>
                    );
                  })}
                </div>
                {clientName&&clientCity&&(
                  <div style={{marginTop:16,background:"#F0FFF4",border:"1px solid #86EFAC",borderRadius:8,padding:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:6}}>Engagement Summary</div>
                    <div style={{fontSize:12,color:C.darkGray,lineHeight:1.8}}>
                      <strong>Client:</strong> {clientName}<br/>
                      <strong>Location:</strong> {clientCity}<br/>
                      <strong>Delivery from:</strong> {DELIVERY_LOCATIONS.filter(d=>deliveryLocs.includes(d.key)).map(d=>d.label).join(", ")}<br/>
                      {engagementRef&&<><strong>Reference:</strong> {engagementRef}</>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section title="Engagement Scope Configuration" icon="⚙️">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Guidewire Modules in Scope</div>
                {MODULES.map(m=>(
                  <label key={m} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer"}}>
                    <input type="checkbox" checked={mods.includes(m)} onChange={()=>toggleMod(m)} style={{accentColor:C.blue,width:15,height:15}}/>
                    <span style={{fontSize:13,fontWeight:600}}>{m}</span>
                    <Badge label={m.includes("Jutro")?"Digital":"Core"} color={m.includes("Jutro")?C.teal:C.blue}/>
                  </label>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Cloud Integrations in Scope</div>
                {INTEGRATIONS.map(i=>(
                  <label key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer"}}>
                    <input type="checkbox" checked={intgs.includes(i)} onChange={()=>toggleIntg(i)} style={{accentColor:C.teal,width:15,height:15}}/>
                    <span style={{fontSize:13}}>{i}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Service Coverage & Ticket Estimation" icon="🕐" accent={C.teal}>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Service Coverage Model</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {COVERAGE_OPTIONS.map(opt=>(
                  <button key={opt.key} onClick={()=>setCovKey(opt.key)}
                    style={{padding:"10px 8px",borderRadius:8,border:"2px solid "+(covKey===opt.key?C.blue:"#CBD5E0"),background:covKey===opt.key?C.blue+"12":"white",cursor:"pointer",textAlign:"left"}}>
                    <div style={{fontSize:11,fontWeight:700,color:covKey===opt.key?C.blue:C.darkGray,marginBottom:3}}>{opt.label}</div>
                    <div style={{fontSize:9,color:C.mid}}>{opt.desc}</div>
                    <div style={{fontSize:10,color:covKey===opt.key?C.blue:C.mid,fontWeight:600,marginTop:3}}>{opt.annualHrs.toLocaleString()} hrs/yr</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
              <Slider label="Avg Hours to Resolve L2 Ticket" min={1} max={16} value={avgL2} onChange={setAvgL2} unit=" hrs" hint="Break-fix / config"/>
              <Slider label="Avg Hours to Resolve L3 Ticket" min={4} max={40} value={avgL3} onChange={setAvgL3} unit=" hrs" hint="Gosu / deep fix"/>
              <Slider label="Estimated Tickets per Month" min={10} max={300} step={5} value={tktMo} onChange={setTktMo} unit="" hint="All modules combined"/>
            </div>
          </Section>

          <Section title="Commercial Parameters" icon="💰" accent={C.navy}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
              <div>
                <Slider label="Sprints per Year" min={12} max={26} value={sprsYr} onChange={setSprsYr} unit=""/>
                <Slider label="Story Points per Sprint" min={10} max={40} value={spPS} onChange={setSpPS} unit=" SP"/>
                <Slider label="Contingency %" min={0} max={30} value={contingency} onChange={setContingency} unit="%" hint="Applied to total programme cost"/>
              </div>
              <div>
                <Slider label="KT Duration" min={2} max={6} value={ktMo} onChange={setKtMo} unit=" months"/>
                <Slider label="Calibration Period" min={2} max={6} value={calMo} onChange={setCalMo} unit=" months"/>
                <div style={{marginTop:14}}>
                  <div style={{fontSize:11,color:C.mid,marginBottom:6}}>Currency</div>
                  <div style={{display:"flex",gap:8}}>
                    {["USD","GBP"].map(c=>(
                      <button key={c} onClick={()=>setCur(c)} style={{padding:"5px 16px",borderRadius:6,border:"2px solid "+(cur===c?C.blue:"#CBD5E0"),background:cur===c?C.blue:"white",color:cur===c?"white":C.mid,fontWeight:700,cursor:"pointer",fontSize:12}}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </>)}

        {/* ── TEAM & RATES ── */}
        {tab==="team"&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <KPI label="Total Programme FTEs" value={totalFTE} sub="Steady-state (before AI)" color={C.blue}/>
            <KPI label="KT Phase FTEs" value={ktFTE} sub={dKtMoSub} color={C.amber}/>
            <KPI label="Steady-State FTEs" value={ssFTE} sub="Post-calibration" color={C.green}/>
            <KPI label="Blended Rate" value={dBlended} sub="Weighted across all locations" color={C.navy}/>
            <KPI label="Contingency" value={dContPct} sub={dContAmt + " over 3 years"} color={C.orange}/>
          </div>

          <Section title="Location Split & Individual Rates" icon="🌍">
            <div style={{marginBottom:16,background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:12,fontSize:12,color:C.darkGray}}>
              Adjust the split (%) between locations — the tool re-balances automatically. Set individual billing rates per location. The <strong>blended rate</strong> is auto-calculated and used in all cost projections.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              {LOCATIONS.map(loc=>(
                <div key={loc.key} style={{border:"2px solid "+loc.color+"40",borderRadius:10,padding:16,background:loc.color+"08"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:20}}>{loc.flag}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:loc.color}}>{loc.label}</div>
                      <div style={{fontSize:10,color:C.mid}}>{loc.country}</div>
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:C.mid,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.04em"}}>Location Split</div>
                    <input type="range" min={0} max={100} value={locSplit[loc.key]}
                      onChange={e=>updateLocSplit(loc.key,Number(e.target.value))}
                      style={{width:"100%",accentColor:loc.color,marginBottom:2}}/>
                    <div style={{textAlign:"center",fontSize:22,fontWeight:800,color:loc.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{locSplit[loc.key]}%</div>
                  </div>
                  <NumInput label={"Rate ("+cur+"/hr)"} value={rates[loc.key]} onChange={v=>updateRate(loc.key,v)} min={20} max={250} prefix={sym}/>
                  <div style={{background:loc.color+"15",borderRadius:6,padding:"6px 10px",marginTop:8}}>
                    <div style={{fontSize:10,color:C.mid}}>FTEs at this location</div>
                    <div style={{fontSize:18,fontWeight:800,color:loc.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{locFTEs[loc.key]}</div>
                    <div style={{fontSize:10,color:C.mid}}>~{sym}{Math.round(locFTEs[loc.key]*rates[loc.key]*FTE_HRS/1000)}K/yr</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:C.gray,borderRadius:10,padding:16,marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:C.mid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Location Summary</div>
              <DT headers={["Location","Country","Split %","FTEs","Rate/hr","FTE Hrs/yr","Annual Cost"]}
                rows={[...LOCATIONS.map(loc=>([
                  loc.flag+" "+loc.label, loc.country,
                  locSplit[loc.key]+"%",
                  locFTEs[loc.key],
                  sym+rates[loc.key],
                  Math.round(locFTEs[loc.key]*FTE_HRS).toLocaleString(),
                  sym+Math.round(locFTEs[loc.key]*rates[loc.key]*FTE_HRS/1000)+"K",
                ])),["TOTAL","","100%",totalFTE,sym+blended+" (blended)",(totalFTE*FTE_HRS).toLocaleString(),sym+(totalFTE*blended*FTE_HRS/1000).toFixed(0)+"K"]]
                } highlight={true}/>
            </div>
          </Section>

          <Section title="Role-Based FTE Breakdown" icon="🧑‍💼" accent={C.navy}>
            <DT headers={["Role / Function","Annual Hrs","FTEs","Onsite FTEs","Offshore (IN)","Nearshore (MX)","Nearshore (MA)"]}
              rows={[...roles.map(r=>[
                r.label,
                r.hrs.toLocaleString(),
                r.fte,
                Math.round(r.fte*(locSplit.onsite/100)*10)/10,
                Math.round(r.fte*(locSplit.offshore/100)*10)/10,
                Math.round(r.fte*(locSplit.nearshoreM/100)*10)/10,
                Math.round(r.fte*(locSplit.nearshoreMO/100)*10)/10,
              ]),["TOTAL",totalBaseHrs.toLocaleString(),totalFTE,Math.round(totalFTE*(locSplit.onsite/100)*10)/10,Math.round(totalFTE*(locSplit.offshore/100)*10)/10,Math.round(totalFTE*(locSplit.nearshoreM/100)*10)/10,Math.round(totalFTE*(locSplit.nearshoreMO/100)*10)/10]]
              } highlight={true}/>
          </Section>
        </>)}

        {/* ── ESTIMATION ── */}
        {tab==="estimation"&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <KPI label="Total Annual Hrs (Base)" value={totalBaseHrs.toLocaleString()} sub="Before AI gains" color={C.blue}/>
            <KPI label="Total FTEs" value={totalFTE} sub={"Blended: " + dBlended} color={C.navy}/>
            <KPI label="Enhancement SP/yr" value={(spPS*sprsYr).toLocaleString()} sub={dSpSub} color={C.green}/>
            <KPI label="Integration Hrs" value={intgHrs} sub={dIntgSub} color={C.teal}/>
            <KPI label="Contingency" value={dContPct} sub={dContSubTot} color={C.orange}/>
          </div>
          <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:12,color:C.darkGray}}>
            <strong style={{color:C.blue}}>Active Parameters:</strong> L2 avg <strong>{avgL2} hrs/ticket</strong> · L3 avg <strong>{avgL3} hrs/ticket</strong> · <strong>{tktMo} tickets/month</strong> · Coverage: <strong>{coverage.label}</strong> · Contingency: <strong>{contingency}%</strong>
          </div>
          <Section title="Module-Level Incident Effort (Annual Base)" icon="📦">
            <DT headers={["Module","L2 Tickets/yr","L2 Hrs","L3 Tickets/yr","L3 Hrs","Total Inc. Hrs","FTEs","Approx Cost/yr"]}
              rows={mods.map(m=>{const d=base.byModule[m];if(!d)return[m,"-","-","-","-","-","-","-"];const t=d.l2hrs+d.l3hrs;const fte=t/FTE_HRS;return[m,d.l2vol,d.l2hrs.toLocaleString(),d.l3vol,d.l3hrs.toLocaleString(),t.toLocaleString(),(fte).toFixed(1),sym+Math.round(fte*blended*FTE_HRS/1000)+"K"];})}/>
          </Section>
          <Section title="Enhancement Delivery & Integration AMS" icon="🚀" accent={C.green}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <DT headers={["Parameter","Value"]} rows={[
                ["Sprint Cadence","Fortnightly (2-week)"],
                ["Sprints per Year",sprsYr],["Story Points / Sprint",spPS],
                ["Total SP / Year",spPS*sprsYr],["Hours / Story Point",SP_HRS+" hrs"],
                ["Enhancement Hrs / Year",base.totalEnhancement.toLocaleString()],
                ["Enhancement FTEs",(base.totalEnhancement/FTE_HRS).toFixed(1)],
                ["Enh Cost/yr",sym+Math.round((base.totalEnhancement/FTE_HRS)*blended*FTE_HRS/1000)+"K"],
              ]}/>
              <DT headers={["Integration","Hrs/yr","FTEs","Cost/yr"]}
                rows={[...intgs.map(i=>[i,60,(60/FTE_HRS).toFixed(2),sym+Math.round(60*blended/1000)+"K"]),["Total "+intgs.length+" integrations",intgHrs,(intgHrs/FTE_HRS).toFixed(1),sym+Math.round(intgHrs*blended/1000)+"K"]]}
                highlight={true}/>
            </div>
          </Section>
        </>)}

        {/* ── KT vs STEADY STATE ── */}
        {tab==="phases"&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <KPI label={dKtLabel} value={ktHrs.toLocaleString()+" hrs"} sub={dKtSub} color={C.amber}/>
            <KPI label={dCalLabel} value={calHrs.toLocaleString()+" hrs"} sub={dCalSub} color={C.teal}/>
            <KPI label={dSsLabel} value={ssHrs.toLocaleString()+" hrs"} sub={dSsSub} color={C.green}/>
            <KPI label="KT Overhead Applied" value={(KT_OVERHEAD*100)+"%"} sub="Shadowing & documentation burden" color={C.orange}/>
          </div>

          <Section title="Phase-by-Phase Cost & FTE Breakdown" icon="📅">
            <DT headers={["Phase","Period","Duration","Hours","FTEs","Base Cost","w/ Contingency","Notes"]}
              rows={[
                ["KT / Mobilisation","Months 1-"+ktMo,ktMo+" months",ktHrs.toLocaleString(),ktFTE,sym+Math.round(ktHrs*blended/1000)+"K",sym+Math.round(ktHrs*blended*(1+contingency/100)/1000)+"K","Includes "+KT_OVERHEAD*100+"% overhead for shadowing & docs"],
                ["Calibration","Months "+(ktMo+1)+"-"+(ktMo+calMo),calMo+" months",calHrs.toLocaleString(),(calHrs/FTE_HRS).toFixed(1),sym+Math.round(calHrs*blended/1000)+"K",sym+Math.round(calHrs*blended*(1+contingency/100)/1000)+"K","No SLA penalties — baseline tracking only"],
                ["Steady-State Y1","Months "+(ktMo+calMo+1)+"-12",Math.max(0,12-ktMo-calMo)+" months",ssHrs.toLocaleString(),ssFTE,sym+Math.round(ssHrs*blended/1000)+"K",sym+Math.round(ssHrs*blended*(1+contingency/100)/1000)+"K","SLA credits/penalties active"],
                ["Steady-State Y2","Months 13-24","12 months",annual[1].hrs.toLocaleString(),(annual[1].hrs/FTE_HRS).toFixed(1),sym+(annual[1].raw/1000).toFixed(0)+"K",sym+(annual[1].cost/1000).toFixed(0)+"K","AI savings: 18% vs baseline"],
                ["Steady-State Y3","Months 25-36","12 months",annual[2].hrs.toLocaleString(),(annual[2].hrs/FTE_HRS).toFixed(1),sym+(annual[2].raw/1000).toFixed(0)+"K",sym+(annual[2].cost/1000).toFixed(0)+"K","AI savings: 28% vs baseline"],
                ["PROGRAMME TOTAL","Months 1-36","36 months",(ktHrs+calHrs+ssHrs+annual[1].hrs+annual[2].hrs).toLocaleString(),totalFTE,sym+(totalRaw/1000000).toFixed(2)+"M",sym+(totalCost/1000000).toFixed(2)+"M","Contingency "+contingency+"% = "+sym+(contingencyAmt/1000).toFixed(0)+"K"],
              ]} highlight={true}/>
          </Section>

          <Section title="Year-by-Year Phase Split by Stream" icon="📊" accent={C.navy}>
            <DT headers={["Stream","Y1 KT Hrs","Y1 KT Cost","Y1 SS Hrs","Y1 SS Cost","Y2 Hrs","Y2 Cost","Y3 Hrs","Y3 Cost"]}
              rows={[
                ["L2 Incident Mgmt",
                  Math.round(base.totalL2*ktFraction*(1+KT_OVERHEAD)).toLocaleString(),sym+Math.round(base.totalL2*ktFraction*(1+KT_OVERHEAD)*blended/1000)+"K",
                  Math.round(base.totalL2*ssFraction).toLocaleString(),sym+Math.round(base.totalL2*ssFraction*blended/1000)+"K",
                  annual[1].l2.toLocaleString(),sym+Math.round(annual[1].l2*blended/1000)+"K",
                  annual[2].l2.toLocaleString(),sym+Math.round(annual[2].l2*blended/1000)+"K"],
                ["L3 Problem Mgmt",
                  Math.round(base.totalL3*ktFraction*(1+KT_OVERHEAD)).toLocaleString(),sym+Math.round(base.totalL3*ktFraction*(1+KT_OVERHEAD)*blended/1000)+"K",
                  Math.round(base.totalL3*ssFraction).toLocaleString(),sym+Math.round(base.totalL3*ssFraction*blended/1000)+"K",
                  annual[1].l3.toLocaleString(),sym+Math.round(annual[1].l3*blended/1000)+"K",
                  annual[2].l3.toLocaleString(),sym+Math.round(annual[2].l3*blended/1000)+"K"],
                ["Enhancements",
                  "0","N/A",
                  annual[0].enh.toLocaleString(),sym+Math.round(annual[0].enh*blended/1000)+"K",
                  annual[1].enh.toLocaleString(),sym+Math.round(annual[1].enh*blended/1000)+"K",
                  annual[2].enh.toLocaleString(),sym+Math.round(annual[2].enh*blended/1000)+"K"],
                ["Integration AMS",
                  Math.round(intgHrs*ktFraction).toLocaleString(),sym+Math.round(intgHrs*ktFraction*blended/1000)+"K",
                  Math.round(intgHrs*ssFraction).toLocaleString(),sym+Math.round(intgHrs*ssFraction*blended/1000)+"K",
                  annual[1].intg.toLocaleString(),sym+Math.round(annual[1].intg*blended/1000)+"K",
                  annual[2].intg.toLocaleString(),sym+Math.round(annual[2].intg*blended/1000)+"K"],
              ]}/>
          </Section>

          <Section title="Location FTE Split by Phase" icon="🌍" accent={C.green}>
            <DT headers={["Location","KT FTEs","KT Cost","Calibration FTEs","SS Y1 FTEs","SS Y1 Cost","SS Y2 FTEs","SS Y3 FTEs"]}
              rows={[...LOCATIONS.map(loc=>{
                const pct=locSplit[loc.key]/100;
                const r=rates[loc.key];
                const ktF=Math.round(ktHrs/FTE_HRS*pct*10)/10;
                const calF=Math.round(calHrs/FTE_HRS*pct*10)/10;
                const ssF=Math.round(ssHrs/FTE_HRS*pct*10)/10;
                const y2F=Math.round(annual[1].hrs/FTE_HRS*pct*10)/10;
                const y3F=Math.round(annual[2].hrs/FTE_HRS*pct*10)/10;
                return[loc.flag+" "+loc.label,ktF,sym+Math.round(ktF*r*FTE_HRS/1000)+"K",calF,ssF,sym+Math.round(ssF*r*FTE_HRS/1000)+"K",y2F,y3F];
              }),["TOTAL",ktFTE,sym+Math.round(ktHrs*blended*(1+contingency/100)/1000)+"K",(calHrs/FTE_HRS).toFixed(1),ssFTE,sym+Math.round(ssHrs*blended*(1+contingency/100)/1000)+"K",(annual[1].hrs/FTE_HRS).toFixed(1),(annual[2].hrs/FTE_HRS).toFixed(1)]]}
              highlight={true}/>
          </Section>
        </>)}

        {/* ── ROADMAP ── */}
        {tab==="roadmap"&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            {annual.map(a=>(
              <KPI key={a.y} label={"Year "+a.y+" Cost (incl. cont.)"} value={sym+(a.cost/1000).toFixed(0)+"K"} sub={a.hrs.toLocaleString()+" hrs · "+(a.hrs/FTE_HRS).toFixed(1)+" FTEs"} color={a.y===1?C.blue:a.y===2?C.teal:C.green}/>
            ))}
            <KPI label="3-Year Total" value={sym+(totalCost/1000000).toFixed(2)+"M"} sub={dContSub3yr} color={C.red}/>
          </div>
          <Section title="3-Year Cost Summary (incl. Contingency)" icon="📈">
            <DT headers={["Stream","Y1 Hrs","Y1 Base","Y1 w/Cont.","Y2 Hrs","Y2 Base","Y2 w/Cont.","Y3 Hrs","Y3 Base","Y3 w/Cont."]}
              rows={[
                ["L2 Incident Mgmt",annual[0].l2.toLocaleString(),sym+Math.round(annual[0].l2*blended/1000)+"K",sym+Math.round(annual[0].l2*blended*(1+contingency/100)/1000)+"K",annual[1].l2.toLocaleString(),sym+Math.round(annual[1].l2*blended/1000)+"K",sym+Math.round(annual[1].l2*blended*(1+contingency/100)/1000)+"K",annual[2].l2.toLocaleString(),sym+Math.round(annual[2].l2*blended/1000)+"K",sym+Math.round(annual[2].l2*blended*(1+contingency/100)/1000)+"K"],
                ["L3 Problem Mgmt", annual[0].l3.toLocaleString(),sym+Math.round(annual[0].l3*blended/1000)+"K",sym+Math.round(annual[0].l3*blended*(1+contingency/100)/1000)+"K",annual[1].l3.toLocaleString(),sym+Math.round(annual[1].l3*blended/1000)+"K",sym+Math.round(annual[1].l3*blended*(1+contingency/100)/1000)+"K",annual[2].l3.toLocaleString(),sym+Math.round(annual[2].l3*blended/1000)+"K",sym+Math.round(annual[2].l3*blended*(1+contingency/100)/1000)+"K"],
                ["Enhancements",    annual[0].enh.toLocaleString(),sym+Math.round(annual[0].enh*blended/1000)+"K",sym+Math.round(annual[0].enh*blended*(1+contingency/100)/1000)+"K",annual[1].enh.toLocaleString(),sym+Math.round(annual[1].enh*blended/1000)+"K",sym+Math.round(annual[1].enh*blended*(1+contingency/100)/1000)+"K",annual[2].enh.toLocaleString(),sym+Math.round(annual[2].enh*blended/1000)+"K",sym+Math.round(annual[2].enh*blended*(1+contingency/100)/1000)+"K"],
                ["Integration AMS", annual[0].intg.toLocaleString(),sym+Math.round(annual[0].intg*blended/1000)+"K",sym+Math.round(annual[0].intg*blended*(1+contingency/100)/1000)+"K",annual[1].intg.toLocaleString(),sym+Math.round(annual[1].intg*blended/1000)+"K",sym+Math.round(annual[1].intg*blended*(1+contingency/100)/1000)+"K",annual[2].intg.toLocaleString(),sym+Math.round(annual[2].intg*blended/1000)+"K",sym+Math.round(annual[2].intg*blended*(1+contingency/100)/1000)+"K"],
                ["TOTAL",annual[0].hrs.toLocaleString(),sym+(annual[0].raw/1000).toFixed(0)+"K",sym+(annual[0].cost/1000).toFixed(0)+"K",annual[1].hrs.toLocaleString(),sym+(annual[1].raw/1000).toFixed(0)+"K",sym+(annual[1].cost/1000).toFixed(0)+"K",annual[2].hrs.toLocaleString(),sym+(annual[2].raw/1000).toFixed(0)+"K",sym+(annual[2].cost/1000).toFixed(0)+"K"],
              ]} highlight={true}/>
          </Section>
          <Section title="Programme Milestones" icon="🗓" accent={C.navy}>
            {[
              {phase:"Phase 0 - KT & Mobilisation",months:"Months 1-"+ktMo,color:C.amber,milestones:["Shadow current SI across all GW modules and integrations","Document runbooks, incident playbooks, Gosu code inventory","Onboard NTT DATA AMS team across all locations (Onsite+Offshore+Nearshore)","Establish tooling: ITSM, Jira, monitoring dashboards, GW Cloud access","Integration mapping and API catalogue for all "+intgs.length+" integrations","KT sign-off gate: knowledge assessment and runbook validation"]},
              {phase:"Phase 1 - Calibration",months:"Months "+(ktMo+1)+"-"+(ktMo+calMo),color:C.teal,milestones:["SLA measurement begins - no penalties in calibration window","Baseline incident volumes and resolution metrics established","First sprint of enhancements delivered to prove velocity","Integration health dashboards go live","Calibration review report - agreed baseline for SLA credits"]},
              {phase:"Year 1 - Steady-State",months:"Months "+(ktMo+calMo+1)+"-12",color:C.blue,milestones:["Full SLA accountability (P1-P4 credits/penalties active)","AI Incident Predictor v1 - reduces MTTR by ~15%","Gosu Copilot active for L3","Quarterly Business Reviews (QBRs)","Enhancement velocity: "+spPS+" SP/sprint sustained"]},
              {phase:"Year 2 - Optimise",months:"Months 13-24",color:C.green,milestones:["AI auto-triage covers 30%+ of L2","Shift-left from L2 to L1","GW Cloud upgrade support","Nearshore team fully ramped and independent","Tech Debt Radar: 100+ Gosu anti-patterns"]},
              {phase:"Year 3 - Innovate",months:"Months 25-36",color:C.purple,milestones:["AI handles 40%+ of L2 autonomously","Predictive incident analytics","Autonomous L2 agent for P3/P4","Contract renewal preparation","Potential scope expansion"]},
            ].map(p=>(
              <div key={p.phase} style={{marginBottom:18,borderLeft:"4px solid "+p.color,paddingLeft:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:13,color:p.color}}>{p.phase}</div>
                  <Badge label={p.months} color={p.color}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 14px"}}>
                  {p.milestones.map((m,i)=>(<div key={i} style={{fontSize:11,color:C.darkGray,display:"flex",gap:5}}><span style={{color:p.color,fontWeight:700}}>&#9658;</span><span>{m}</span></div>))}
                </div>
              </div>
            ))}
          </Section>
        </>)}

        {/* ── SLA ── */}
        {tab==="sla"&&(<>
          <Section title="SLA Framework - Priority Matrix" icon="⚖️" accent={C.red}>
            <DT headers={["Priority","Definition","Response SLA","Resolution SLA","Penalty (per breach)","Credit Cap"]} rows={[
              ["P1 - Critical","GW prod system down / major claims/policy impact","15 min","4 hrs","5% monthly fee","15% of monthly"],
              ["P2 - High","Significant functionality impaired, workaround exists","30 min","8 hrs","2% monthly fee","10% of monthly"],
              ["P3 - Medium","Non-critical issue, limited user impact","2 hrs","24 hrs","1% monthly fee","5% of monthly"],
              ["P4 - Low","Cosmetic / informational, no business impact","4 hrs","72 hrs","0.5% monthly fee","2% of monthly"],
            ]}/>
            <div style={{marginTop:14,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:8,padding:12}}>
              <div style={{fontWeight:700,color:C.amber,fontSize:11,marginBottom:5}}>Credit and Penalty Framework Rules</div>
              <div style={{fontSize:11,color:C.darkGray,lineHeight:1.7}}>
                Credits apply from <strong>Month {ktMo+calMo+1}</strong> onward · Coverage: <strong>{coverage.label}</strong> ·
                Max aggregate: <strong>25% monthly fee</strong> · Exclusions: GW Cloud outages, client delays, freeze windows ·
                Incentive: &gt;98% adherence x3 months = 1% fee reduction
              </div>
            </div>
          </Section>
          <Section title="Integration SLA Addendum" icon="🔗" accent={C.teal}>
            <DT headers={["Integration","Monitoring","Alert SLA","Fix SLA (P2)","Escalation"]} rows={intgs.map(i=>[i,"24x7 automated","15 min","8 hrs","GW + Vendor bridge"])}/>
          </Section>
          <Section title="Governance & Reporting Cadence" icon="📋" accent={C.navy}>
            <DT headers={["Report/Meeting","Frequency","Audience","Content"]} rows={[
              ["Daily Stand-up","Daily","AMS Squad","Open incidents, blockers, sprint progress"],
              ["Weekly Service Report","Weekly","Client IT Lead","Incident volumes, SLA adherence, sprint velocity"],
              ["Monthly Service Review","Monthly","IT Director","SLA scorecard, credits, backlog, AI metrics"],
              ["Quarterly Business Review","Quarterly","CIO / Exec Sponsor","Programme health, roadmap, value delivered"],
              ["Annual Contract Review","Annually","Procurement / Legal","SLA renegotiation, scope changes, commercial terms"],
            ]}/>
          </Section>
        </>)}

        {/* ── AI ── */}
        {tab==="ai"&&(<>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <KPI label="Y1 AI Gain" value="8%" sub="Auto-triage & copilot" color={C.teal}/>
            <KPI label="Y2 AI Gain" value="18%" sub="Predictive ops" color={C.green}/>
            <KPI label="Y3 AI Gain" value="28%" sub="Autonomous L2" color={C.purple}/>
            <KPI label="3-Yr Hrs Saved" value={dAISaved} sub="vs. no-AI baseline" color={C.blue}/>
          </div>
          <Section title="AI Accelerator Roadmap" icon="🤖">
            {[
              {name:"GW Incident Auto-Triage",year:"Y1 Q1",color:C.teal,impact:"High",desc:"AI classifier assigns priority (P1-P4), routes to L2/L3, suggests resolution from runbooks.",benefit:"Triage: 30min to <5min. Works across all modules."},
              {name:"Gosu Code Copilot",year:"Y1 Q2",color:C.blue,impact:"High",desc:"LLM trained on Gosu patterns. Real-time suggestions, anti-pattern warnings, auto unit tests.",benefit:"30% reduction in L3 MTTR. Tech Debt Radar integrated."},
              {name:"Incident Predictor",year:"Y1 Q3",color:C.purple,impact:"Medium",desc:"ML model predicts spike events (renewal season, month-end billing) and pre-scales capacity.",benefit:"Proactive staffing - avoids SLA breach during peaks."},
              {name:"AI Release Notes Summariser",year:"Y1 Q4",color:C.amber,impact:"Medium",desc:"Processes GW quarterly releases, generates per-module change impact assessments.",benefit:"Saves ~16 hrs per release cycle."},
              {name:"GW Test DataHub AI",year:"Y2 Q1",color:C.green,impact:"High",desc:"AI test data generation with GDPR/CDA masking. Supports Policy, Claim, Account entities.",benefit:"UAT setup time -60%. More SP per sprint."},
              {name:"Autonomous L2 Agent",year:"Y3 Q1",color:C.red,impact:"Transformational",desc:"Agentic AI executes pre-approved runbooks for P3/P4 incidents without human intervention.",benefit:"Handles 30-40% of L2 autonomously."},
            ].map(ai=>(
              <div key={ai.name} style={{border:"1px solid "+ai.color+"30",borderRadius:10,padding:14,marginBottom:12,borderLeft:"5px solid "+ai.color}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:13,color:ai.color}}>{ai.name}</div>
                  <div style={{display:"flex",gap:6}}><Badge label={ai.year} color={ai.color}/><Badge label={"Impact: "+ai.impact} color={ai.impact==="Transformational"?C.red:ai.impact==="High"?C.blue:C.amber}/></div>
                </div>
                <div style={{fontSize:11,color:C.darkGray,marginBottom:4}}>{ai.desc}</div>
                <div style={{fontSize:11,color:ai.color,fontWeight:600}}>Benefit: {ai.benefit}</div>
              </div>
            ))}
          </Section>
        </>)}

        {/* ── KT PLAN ── */}
        {tab==="kt"&&(<>
          <Section title={"Knowledge Transition Plan - "+ktMo+"-Month Programme"} icon="🔄">
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:12,marginBottom:16,fontSize:11,color:C.darkGray,lineHeight:1.7}}>
              KT spans <strong>{ktMo} months</strong> + <strong>{calMo} months calibration</strong> · SLA live Month {ktMo+calMo+1} ·
              NTT DATA in shadow mode first {Math.ceil(ktMo/2)} months · KT overhead: <strong>{KT_OVERHEAD*100}%</strong> above steady-state effort ·
              Team covers: {LOCATIONS.filter(l=>locSplit[l.key]>0).map(l=>l.flag+" "+l.label).join(", ")}
            </div>
            {[
              {month:"Month 1",title:"Discovery & Shadow",color:C.amber,activities:["Onboard NTT DATA AMS team (all locations — Onsite + Offshore IN + Nearshore MX + MA)","Receive all documentation: runbooks, architecture docs, Gosu code repos from incumbent","Shadow incidents across PC, CC, BC, Digital — observe triage and resolution","Map all "+intgs.length+" integrations: endpoints, auth, data flows, error patterns","Establish GW Cloud access, ITSM credentials, monitoring tool access","Interview incumbent team: tribal knowledge capture sessions"],deliverable:"Discovery Report, Knowledge Gap Analysis, Onboarding Checklist"},
              {month:"Month 2",title:"Runbook Creation & Parallel Operations",color:C.teal,activities:["NTT DATA authors runbooks for top 50 incident patterns per module","Gosu code walkthrough: all custom extensions, business rules, plugins","Integration runbooks: error resolution for each of "+intgs.length+" integrations","First NTT DATA-led incident resolutions (with incumbent oversight)","Enhancement process walkthrough: backlog grooming, sprint delivery, GW Cloud deploy","Training completion: GW Cloud ops certification for L2/L3 team (all locations)"],deliverable:"50 Runbooks, Integration Playbooks, Training Completion Report"},
              {month:"Month 3",title:"Primary Accountability + KT Sign-Off",color:C.green,activities:["NTT DATA takes primary incident ownership across all modules","Incumbent available on advisory basis only (escalation backstop)","First sprint of enhancement delivery completed and demonstrated","KT Assessment: knowledge quiz, incident simulation exercise","Integration monitoring fully transitioned to NTT DATA dashboards","KT Sign-Off Gate: client + NTT DATA + incumbent agreement"],deliverable:"KT Sign-Off Certificate, Full Runbook Library, Go/No-Go Assessment"},
            ].slice(0,ktMo).map(m=>(
              <div key={m.month} style={{marginBottom:18,borderLeft:"4px solid "+m.color,paddingLeft:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:13,color:m.color}}>{m.month}: {m.title}</div>
                  <Badge label="KT Phase" color={m.color}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 14px",marginBottom:8}}>
                  {m.activities.map((a,i)=>(<div key={i} style={{fontSize:11,color:C.darkGray,display:"flex",gap:5}}><span style={{color:m.color,fontWeight:700}}>&#9658;</span><span>{a}</span></div>))}
                </div>
                <div style={{background:m.color+"12",border:"1px solid "+m.color+"30",borderRadius:6,padding:"5px 10px",fontSize:10,fontWeight:600,color:m.color}}>Deliverable: {m.deliverable}</div>
              </div>
            ))}
          </Section>
          <Section title={"Calibration Period - "+calMo+" Months"} icon="🎯" accent={C.navy}>
            <div style={{background:"#F0FFF4",border:"1px solid #86EFAC",borderRadius:8,padding:12,marginBottom:14,fontSize:11,color:C.darkGray,lineHeight:1.7}}>
              Calibration (Months {ktMo+1}-{ktMo+calMo}): SLA tracked but <strong>no credits/penalties</strong>.
              Establishes agreed performance baseline. SLA live Month {ktMo+calMo+1}.
            </div>
            <DT headers={["Calibration Activity","Owner","When"]} rows={[
              ["Track incident volumes vs. baseline","NTT DATA AMS Lead","Monthly"],
              ["Measure resolution times vs. SLA","Service Delivery Manager","Weekly"],
              ["Enhancement velocity: SP delivered vs. committed","Delivery Manager","Per Sprint"],
              ["Integration uptime and error tracking","Integration Lead","Continuous"],
              ["Calibration Review Report to client","NTT DATA SDM","Month "+(ktMo+calMo)],
              ["SLA penalties and credits activated","Contract Live","Month "+(ktMo+calMo+1)],
            ]}/>
          </Section>
          <Section title="KT Risk Register" icon="⚠️" accent={C.red}>
            <DT headers={["Risk","Likelihood","Impact","Mitigation"]} rows={[
              ["Incumbent SI non-cooperation","Medium","High","Contractual KT obligations; weekly progress reviews with client"],
              ["Gosu code undocumented — tribal knowledge only","High","High","Code archaeology sessions; NTT DATA Gosu Copilot assists discovery"],
              ["Integration credentials / access delays","Medium","Medium","Early access request; parallel credential provisioning Month 1"],
              ["Volume underestimate (incidents higher than baseline)","Medium","Medium","30% calibration buffer; agree true-up mechanism"],
              ["Offshore/nearshore team ramp delay","Medium","Medium","2-week pre-boarding; local leads hired before go-live"],
              ["Key resource attrition during KT","Low","High","2x coverage per role; docs prevent single-dependency"],
            ]}/>
          </Section>
        </>)}

      </div>

      <div style={{background:C.navy,color:"#93C5FD",textAlign:"center",padding:"14px 20px",fontSize:10,letterSpacing:"0.04em"}}>
        NTT DATA — Guidewire Practice · AMS Engagement Estimator · Confidential &amp; Proprietary · {new Date().getFullYear()}
      </div>
    </div>
  );
}
