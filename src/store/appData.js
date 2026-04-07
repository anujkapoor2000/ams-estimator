// src/store/appData.js
export const MODULES = ["PolicyCenter (PC)","ClaimCenter (CC)","BillingCenter (BC)","Digital - Jutro"];
export const INTEGRATIONS = ["Policy Data Service","Payment Gateway","FNOL / Third-Party Claims","Document Management (DocuSign)","External Rating Engine","BI / Analytics (Snowflake)"];

export const COVERAGE_OPTIONS = [
  {label:"Normal Business Hours (8x5)",key:"8x5",annualHrs:2080,desc:"Mon–Fri 8am–6pm"},
  {label:"Extended Hours (12x5)",      key:"12x5",annualHrs:3120,desc:"Mon–Fri 7am–7pm"},
  {label:"Extended + Weekend (12x7)",  key:"12x7",annualHrs:4368,desc:"Mon–Sun 7am–7pm"},
  {label:"24×7 Full Managed Service",  key:"24x7",annualHrs:8760,desc:"Round-the-clock"},
];

export const LOCATIONS = [
  {key:"onsite",  label:"Onsite",      flag:"🏢",country:"Client Site",    defaultRate:145, defaultMargin:18, color:"#2A51C1"},
  {key:"offshore",label:"Offshore IN", flag:"🇮🇳",country:"India",          defaultRate:45,  defaultMargin:38, color:"#F59E0B"},
  {key:"nearMX",  label:"Nearshore MX",flag:"🇲🇽",country:"Mexico",         defaultRate:75,  defaultMargin:30, color:"#10B981"},
  {key:"nearMA",  label:"Nearshore MA",flag:"🇲🇦",country:"Morocco",        defaultRate:65,  defaultMargin:32, color:"#EF4444"},
  {key:"alchemy", label:"Alchemy NI",  flag:"🏴󠁧󠁢󠁮󠁩󠁲󠁿",country:"N. Derry, UK",  defaultRate:68,  defaultMargin:28, color:"#8B5CF6"},
];

export const CLIENT_REGIONS = [
  {region:"North America",  cities:["New York, USA","Chicago, USA","Dallas, USA","Toronto, Canada"]},
  {region:"Europe",         cities:["London, UK","Paris, France","Frankfurt, Germany","Madrid, Spain","Zurich, Switzerland","Belfast, UK"]},
  {region:"Middle East & Africa",cities:["Dubai, UAE","Riyadh, Saudi Arabia","Casablanca, Morocco"]},
  {region:"Asia Pacific",   cities:["Singapore","Sydney, Australia","Tokyo, Japan","Mumbai, India"]},
  {region:"Latin America",  cities:["São Paulo, Brazil","Buenos Aires, Argentina"]},
];

export const DELIVERY_CENTRES = [
  {key:"bangalore", label:"Bangalore, India",     flag:"🇮🇳",tz:"IST +5:30"},
  {key:"hyderabad", label:"Hyderabad, India",     flag:"🇮🇳",tz:"IST +5:30"},
  {key:"chennai",   label:"Chennai, India",       flag:"🇮🇳",tz:"IST +5:30"},
  {key:"cdmx",      label:"Mexico City, Mexico",  flag:"🇲🇽",tz:"CST -6"},
  {key:"monterrey", label:"Monterrey, Mexico",    flag:"🇲🇽",tz:"CST -6"},
  {key:"casablanca",label:"Casablanca, Morocco",  flag:"🇲🇦",tz:"WET +1"},
  {key:"rabat",     label:"Rabat, Morocco",       flag:"🇲🇦",tz:"WET +1"},
  {key:"derry",     label:"Alchemy, N. Derry UK", flag:"🏴󠁧󠁢󠁮󠁩󠁲󠁿",tz:"GMT +0"},
  {key:"london",    label:"London, UK",           flag:"🇬🇧",tz:"GMT +0"},
  {key:"dallas",    label:"Dallas, USA",          flag:"🇺🇸",tz:"CST -6"},
];

export const ROLES = [
  {key:"sdm",  label:"Service Delivery Manager",  l2:"A",l3:"A",enh:"A",kt:"A",  l2w:0.20,l3w:0.10,enhw:0,   ktw:0.05, desc:"Overall service accountability, client relationship"},
  {key:"lead", label:"AMS Lead / Architect",      l2:"R",l3:"R",enh:"R",kt:"R",  l2w:0,   l3w:0.15,enhw:0.10,ktw:0.20, desc:"Technical authority, solution design, Gosu governance"},
  {key:"l2eng",label:"L2 Support Engineer",       l2:"R",l3:"C",enh:"I",kt:"R",  l2w:0.55,l3w:0,   enhw:0,   ktw:0.25, desc:"Incident resolution, break-fix, configuration"},
  {key:"l3eng",label:"L3 Gosu Dev Engineer",      l2:"C",l3:"R",enh:"R",kt:"R",  l2w:0,   l3w:0.60,enhw:0.30,ktw:0.20, desc:"Gosu code changes, problem mgmt, enhancement delivery"},
  {key:"ba",   label:"Business Analyst",          l2:"I",l3:"I",enh:"R",kt:"C",  l2w:0,   l3w:0,   enhw:0.30,ktw:0.15, desc:"Requirements, user stories, UAT coordination"},
  {key:"qa",   label:"QA / Test Engineer",        l2:"I",l3:"C",enh:"R",kt:"C",  l2w:0,   l3w:0,   enhw:0.20,ktw:0.10, desc:"Test planning, automation, UAT execution"},
  {key:"intg", label:"Integration Engineer",      l2:"R",l3:"R",enh:"C",kt:"R",  l2w:0.25,l3w:0.15,enhw:0.10,ktw:0.10, desc:"API health, integration triage, data flows"},
];

export const RISKS = [
  {id:1,risk:"Incumbent SI non-cooperation",          likelihood:"Medium",impact:"High",  mitigation:"Contractual KT obligations; weekly client progress reviews"},
  {id:2,risk:"Gosu code undocumented — tribal knowledge",likelihood:"High",impact:"High", mitigation:"Code archaeology; Gosu Copilot AI assists code discovery"},
  {id:3,risk:"Integration credentials / access delays",likelihood:"Medium",impact:"Medium",mitigation:"Early access requests; parallel provisioning Month 1"},
  {id:4,risk:"Volume underestimate vs. baseline",     likelihood:"Medium",impact:"Medium",mitigation:"30% calibration buffer; agree true-up mechanism"},
  {id:5,risk:"Multi-location team ramp delay",        likelihood:"Medium",impact:"Medium",mitigation:"Staggered onboarding; local leads hired before go-live"},
  {id:6,risk:"Key resource attrition during KT",      likelihood:"Low",  impact:"High",  mitigation:"2× coverage per role; docs prevent single-person dependency"},
  {id:7,risk:"GW Cloud upgrade during KT",            likelihood:"Low",  impact:"Medium",mitigation:"Freeze window agreed; upgrade support built into KT plan"},
];

export const DEFAULT_AI_ACCELERATORS = [
  {id:"a1",name:"GW Incident Auto-Triage",    timeline:"Y1 Q1",impact:"High",         gainIdx:0, enabled:true, desc:"AI assigns P1–P4, routes to correct queue, suggests runbook resolution.",       benefit:"Triage: 30min → <5min. 5% efficiency gain in Y1."},
  {id:"a2",name:"Gosu Code Copilot",          timeline:"Y1 Q2",impact:"High",         gainIdx:1, enabled:true, desc:"LLM trained on Gosu patterns. Real-time suggestions, anti-pattern detection.", benefit:"30% reduction in L3 MTTR."},
  {id:"a3",name:"Incident Predictor",         timeline:"Y1 Q3",impact:"Medium",       gainIdx:1, enabled:true, desc:"ML predicts spike events (renewal, month-end) and pre-scales capacity.",       benefit:"Avoids SLA breach during high-volume windows."},
  {id:"a4",name:"AI Release Notes Summariser",timeline:"Y1 Q4",impact:"Medium",       gainIdx:1, enabled:true, desc:"Processes GW releases; generates per-module change impact assessments.",       benefit:"Saves ~16 hrs per release cycle."},
  {id:"a5",name:"GW Test DataHub AI",         timeline:"Y2 Q1",impact:"High",         gainIdx:2, enabled:true, desc:"AI test data generation with GDPR/CDA masking for all GW entities.",          benefit:"UAT setup -60%. More SP delivered per sprint."},
  {id:"a6",name:"Autonomous L2 Agent",        timeline:"Y3 Q1",impact:"Transformational",gainIdx:3,enabled:true,desc:"Agentic AI executes pre-approved runbooks for P3/P4 incidents.",              benefit:"Handles 30–40% of L2 autonomously."},
];

export const AI_GAIN_CURVE = [0.05,0.10,0.18,0.24,0.28,0.31,0.34];
export const BASE_INC = {L2:{PC:180,CC:150,BC:90,Digital:60},L3:{PC:60,CC:50,BC:30,Digital:20}};
export const FTE_HRS  = 1760;
export const SP_HRS   = 6.8;
export const KT_OVERHEAD = 0.40;

export const VERSION_LABELS = ["Draft","V1","V2","Final"];

export function getModKey(mod){ return mod.includes("PC")?"PC":mod.includes("CC")?"CC":mod.includes("BC")?"BC":"Digital"; }

export function calcBase(mods,spPS,spY,avgL2,avgL3,tkt){
  const res={};let tL2=0,tL3=0;
  const defTot=Object.values(BASE_INC.L2).reduce((s,v)=>s+v,0)+Object.values(BASE_INC.L3).reduce((s,v)=>s+v,0);
  const sf=(tkt*12)/(defTot*12);
  (mods||[]).forEach(m=>{
    const k=getModKey(m);
    const l2v=Math.round(BASE_INC.L2[k]*sf*12),l3v=Math.round(BASE_INC.L3[k]*sf*12);
    res[m]={l2hrs:Math.round(l2v*avgL2),l3hrs:Math.round(l3v*avgL3),l2vol:l2v,l3vol:l3v};
    tL2+=res[m].l2hrs;tL3+=res[m].l3hrs;
  });
  return{byModule:res,totalL2:tL2,totalL3:tL3,totalEnh:Math.round(spPS*spY*SP_HRS)};
}

export function blendedCostRate(ls,rates){ return LOCATIONS.reduce((s,l)=>s+(ls[l.key]/100)*rates[l.key],0); }
export function getSellRate(key,rates,margins,fixedSell){ const fo=fixedSell[key]; return fo!=null?fo:rates[key]*(1+(margins[key]/100)); }
export function blendedSellRate(ls,rates,margins,fixedSell){ return LOCATIONS.reduce((s,l)=>s+(ls[l.key]/100)*getSellRate(l.key,rates,margins,fixedSell),0); }
export function splitFTE(tot,ls){ const o={}; LOCATIONS.forEach(l=>{o[l.key]=Math.round(tot*(ls[l.key]/100)*10)/10;}); return o; }

export function buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont){
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const rows=[];let ssGainIdx=0;
  for(let yr=1;yr<=totalYrs;yr++){
    let ktH=0,calH=0,ssH=0;
    if(yr===1){
      const kf=Math.min(ktMo,12)/12,cf=Math.min(calMo,Math.max(0,12-ktMo))/12,sf=Math.max(0,1-kf-cf);
      ktH=Math.round(annualBase*kf*(1+KT_OVERHEAD));
      calH=Math.round(annualBase*cf*1.10);
      ssH=Math.round(annualBase*sf*(1-AI_GAIN_CURVE[ssGainIdx]));
      if(sf>0)ssGainIdx++;
    } else {
      const g=AI_GAIN_CURVE[Math.min(ssGainIdx,AI_GAIN_CURVE.length-1)];
      ssH=Math.round(annualBase*(1-g));ssGainIdx++;
    }
    const totalH=ktH+calH+ssH;
    const rawCost=Math.round(totalH*blendC),rawSell=Math.round(totalH*blendS);
    rows.push({yr,ktH,calH,ssH,totalH,rawCost,rawSell,costWC:Math.round(rawCost*(1+cont/100)),sellWC:Math.round(rawSell*(1+cont/100)),aiGainPct:Math.round(AI_GAIN_CURVE[Math.min(ssGainIdx-1,AI_GAIN_CURVE.length-1)]*100),noAiHrs:annualBase});
  }
  return rows;
}

export function defaultOpp(id){
  return {
    id, name:"New Engagement", client:"", clientCity:"", clientRegion:"Europe",
    status:"Draft", version:"Draft", versionHistory:[],
    currency:"USD", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
    wizardStep:0, wizardComplete:false,
    mods:[...MODULES], intgs:INTEGRATIONS.slice(0,5),
    spY:26,spS:20,ktMo:3,calMo:3,totalYrs:3,
    avgL2:4,avgL3:12,tkt:60,covKey:"8x5",cont:10,
    dlocs:["bangalore","casablanca","cdmx","derry"], engRef:"",
    ls:{onsite:12,offshore:45,nearMX:18,nearMA:15,alchemy:10},
    rates:Object.fromEntries(LOCATIONS.map(l=>[l.key,l.defaultRate])),
    margins:Object.fromEntries(LOCATIONS.map(l=>[l.key,l.defaultMargin])),
    fixedSell:{onsite:null,offshore:null,nearMX:null,nearMA:null,alchemy:null},
    accelerators:[...DEFAULT_AI_ACCELERATORS],
  };
}
