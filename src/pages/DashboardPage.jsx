// src/pages/DashboardPage.jsx
import { T, font } from "../design.js";
import { Card, Metric, BarChart, ShoreBar, Btn } from "../components/ui.jsx";
import {
  LOCATIONS, buildPlan, blendedCostRate, blendedSellRate,
  splitFTERounded, roundFTE, calcBase, FTE_HRS,
} from "../store/appData.js";

const VERSION_COLORS = {Draft:"#8B94B3", V1:"#4D93F8", V2:"#14B8A6", Final:"#10B981"};
const VERSION_BG     = {Draft:"rgba(255,255,255,0.12)", V1:"rgba(77,147,248,0.25)", V2:"rgba(20,184,166,0.25)", Final:"rgba(16,185,129,0.25)"};

export default function DashboardPage({opp,opps,onPage,sym,fxRate,currency,onEdit}){
  if(!opp) return(
    <div style={{padding:40,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>📋</div>
      <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>No opportunity selected</div>
      <div style={{fontSize:13,color:T.textSoft,marginBottom:24}}>Select or create an opportunity to view its dashboard</div>
      <Btn onClick={()=>onPage("opportunities")}>Go to Opportunities</Btn>
    </div>
  );

  const {ls,rates,margins,fixedSell,mods,intgs,spY,spS,ktMo,calMo,totalYrs,avgL2,avgL3,tkt,cont,accelerators} = opp;
  const cvt = v => currency==="GBP" ? v*(fxRate||0.79) : v;
  const intgHrs = (intgs||[]).length*60;
  const base = calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const blendC = blendedCostRate(ls,rates);
  const blendS = blendedSellRate(ls,rates,margins,fixedSell);
  const plan   = buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont,ls,accelerators);

  const totSell = plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost = plan.reduce((s,r)=>s+r.costWC,0);
  const totMargin = totSell-totCost;
  const annBase = base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const baseFTE = roundFTE(annBase/FTE_HRS);
  const blendedMarginPct = blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  const locFTEs = splitFTERounded(baseFTE,ls);
  const hrsSaved = plan.reduce((s,r)=>s+(r.noAiHrs-r.totalH),0);
  const curVer = opp.version||"Draft";

  const shoreRevData = LOCATIONS.filter(l=>ls[l.key]>0).map(l=>{
    const sr = fixedSell[l.key]!=null?fixedSell[l.key]:rates[l.key]*(1+(margins[l.key]/100));
    return {label:l.label, val:Math.round(locFTEs[l.key]*sr*FTE_HRS), color:l.color};
  });

  const pipelineStats = {
    total:opps.length,
    active:opps.filter(o=>o.status==="Active").length,
    won:opps.filter(o=>o.status==="Won").length,
  };

  return(
    <div style={{padding:"24px 28px 40px"}}>

      {/* Hero band */}
      <div style={{background:"linear-gradient(135deg,#0D1B3E 0%,#1A3A9F 60%,#2A51C1 100%)",borderRadius:T.rLg,padding:"22px 26px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <div>
          <div style={{color:"rgba(255,255,255,0.55)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Engagement Overview</div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:3}}>
            <div style={{color:"white",fontSize:20,fontWeight:800,fontFamily:font.display}}>{opp.name}</div>
            <span style={{padding:"2px 10px",borderRadius:100,background:VERSION_BG[curVer],color:VERSION_COLORS[curVer],border:`1px solid ${VERSION_COLORS[curVer]}50`,fontSize:10,fontWeight:700}}>
              {curVer}
            </span>
            <button onClick={onEdit} style={{padding:"4px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ✏ Edit
            </button>
          </div>
          <div style={{color:"#7BA7F8",fontSize:12}}>{opp.client}{opp.clientCity?" · "+opp.clientCity:""} · {totalYrs}-Year Plan · {baseFTE} FTE baseline</div>
        </div>
        <div style={{display:"flex",gap:26,flexWrap:"wrap"}}>
          {[
            {l:"Total Sell",  v:sym+Math.round(cvt(totSell)/1000)+"K",   c:"white"},
            {l:"Gross Margin",v:sym+Math.round(cvt(totMargin)/1000)+"K", c:"#4ADBA2"},
            {l:"Margin %",    v:blendedMarginPct+"%",                     c:"#4ADBA2"},
            {l:"Baseline FTEs",v:baseFTE+" FTE",                          c:"#7BA7F8"},
          ].map(item=>(<div key={item.l} style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>{item.l}</div>
            <div style={{fontSize:19,fontWeight:700,color:item.c,fontFamily:font.display}}>{item.v}</div>
          </div>))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"flex",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <Metric label="Total Sell Price"  value={sym+Math.round(cvt(totSell)/1000)+"K"}    sub={"incl. "+cont+"% contingency"}  icon="💰" color={T.blue}/>
        <Metric label="Total Cost"        value={sym+Math.round(cvt(totCost)/1000)+"K"}    sub="NTT DATA delivery cost"          icon="📉" color={T.blueDark}/>
        <Metric label="Gross Margin"      value={sym+Math.round(cvt(totMargin)/1000)+"K"}  sub={blendedMarginPct+"% blended"}    icon="📈" color={T.green}/>
        <Metric label="AI Hours Saved"    value={hrsSaved.toLocaleString()}                sub={"over "+totalYrs+" years"}       icon="⚡" color="#8B5CF6"/>
        <Metric label="Baseline FTEs"     value={baseFTE}                                  sub="Y1 before AI reduction"          icon="👥" color={T.teal}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Cost vs Sell */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Cost vs Sell by Year</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>With {cont}% contingency applied</div>
          <BarChart
            data={plan.map(r=>({label:"Y"+r.yr,cost:Math.round(cvt(r.costWC)),sell:Math.round(cvt(r.sellWC))}))}
            keys={["cost","sell"]} colors={[T.blueDark,T.blue]} labels={["Cost","Sell"]} height={160} sym={sym}/>
        </Card>

        {/* Team size by year — NEW */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Team Size by Year (FTEs)</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>AI efficiency reduces team size each year — rounded to nearest 0.5 FTE</div>
          <BarChart
            data={plan.map(r=>({label:"Y"+r.yr,fte:r.ftePerYear}))}
            keys={["fte"]} colors={[T.teal]} labels={["FTEs"]} height={120} sym=""/>
          <div style={{marginTop:12,display:"flex",gap:7,flexWrap:"wrap"}}>
            {plan.map((r,i)=>{
              const prev = i===0?null:plan[i-1].ftePerYear;
              const delta = prev===null?null:r.ftePerYear-prev;
              return(
                <div key={r.yr} style={{flex:1,padding:"8px 9px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`,textAlign:"center",minWidth:56}}>
                  <div style={{fontSize:9,color:T.textSoft,marginBottom:2}}>Y{r.yr}</div>
                  <div style={{fontSize:18,fontWeight:800,color:T.teal,fontFamily:font.display}}>{r.ftePerYear}</div>
                  <div style={{fontSize:9,color:"#8B5CF6",marginBottom:2}}>-{r.aiGainPct}% AI</div>
                  {delta!==null&&delta!==0&&(
                    <div style={{fontSize:9,fontWeight:700,color:delta<0?"#10B981":"#F59E0B"}}>{delta<0?delta:"+"+delta}</div>
                  )}
                  {delta===null&&<div style={{fontSize:8,color:T.textSoft}}>baseline</div>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* AI efficiency */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>AI Efficiency Gains</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>Hours with vs without AI — accelerators reduce both hours and team size</div>
          <BarChart
            data={plan.map(r=>({label:"Y"+r.yr,noai:r.noAiHrs,ai:r.totalH}))}
            keys={["noai","ai"]} colors={["#D1D9EE",T.teal]} labels={["No AI","With AI"]} height={140} sym=""/>
          <div style={{marginTop:10,padding:"8px 12px",background:"#CCFBF1",borderRadius:T.r,fontSize:11,color:T.teal,fontWeight:600}}>
            {sym}{Math.round(cvt(hrsSaved*blendC/1000))}K cost saving · {hrsSaved.toLocaleString()} hrs saved across {totalYrs} yrs
          </div>
        </Card>

        {/* Year-by-year summary */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Year-by-Year Plan</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>FTEs decrease as AI accelerators compound</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {plan.map(r=>(
              <div key={r.yr} style={{padding:"9px 11px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>Year {r.yr}</span>
                    {r.ktH>0&&<span style={{fontSize:9,background:"#FEF3C7",color:"#D97706",borderRadius:3,padding:"1px 5px",fontWeight:600}}>KT</span>}
                    {r.calH>0&&<span style={{fontSize:9,background:"#CCFBF1",color:"#0D9488",borderRadius:3,padding:"1px 5px",fontWeight:600}}>Cal</span>}
                    {r.ssH>0&&<span style={{fontSize:9,background:"#D1FAE5",color:"#059669",borderRadius:3,padding:"1px 5px",fontWeight:600}}>SS -{r.aiGainPct}%</span>}
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.teal}}>{r.ftePerYear} FTE</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{sym}{Math.round(cvt(r.sellWC/1000))}K</span>
                  </div>
                </div>
                {/* Location FTE breakdown for this year */}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
                  {LOCATIONS.filter(l=>ls[l.key]>0&&r.locFTEsYear[l.key]>0).map(l=>(
                    <span key={l.key} style={{fontSize:9,color:l.color,fontWeight:600}}>{l.flag}{r.locFTEsYear[l.key]}</span>
                  ))}
                </div>
                <div style={{height:4,background:T.border,borderRadius:100,overflow:"hidden"}}>
                  <div style={{height:"100%",width:(r.sellWC/totSell*100)+"%",background:T.blue,borderRadius:100}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Shore revenue */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Revenue by Delivery Shore</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>Annual sell revenue split</div>
          <ShoreBar data={shoreRevData} sym={sym}/>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:5}}>
            {LOCATIONS.filter(l=>ls[l.key]>0&&locFTEs[l.key]>0).map(l=>{
              const sr=fixedSell[l.key]!=null?fixedSell[l.key]:rates[l.key]*(1+(margins[l.key]/100));
              return(
                <div key={l.key} style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:2,background:l.color,flexShrink:0}}/>
                  <span style={{fontSize:11,color:T.text,flex:1}}>{l.flag} {l.label}</span>
                  <span style={{fontSize:11,color:T.textSoft}}>{locFTEs[l.key]} FTE</span>
                  <span style={{fontSize:11,fontWeight:600,color:l.color}}>{sym}{Math.round(cvt(sr))}/hr</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Pipeline */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Pipeline Overview</div>
          <div style={{fontSize:11,color:T.textSoft,marginBottom:14}}>{pipelineStats.total} opportunities tracked</div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            {[{l:"Total",v:pipelineStats.total,c:T.blue},{l:"Active",v:pipelineStats.active,c:T.green},{l:"Won",v:pipelineStats.won,c:T.teal}].map(s=>(
              <div key={s.l} style={{flex:1,padding:"12px",background:T.bg,borderRadius:T.r,textAlign:"center",border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.textSoft,marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.c,fontFamily:font.display}}>{s.v}</div>
              </div>
            ))}
          </div>
          <Btn size="sm" variant="secondary" onClick={()=>onPage("opportunities")}>View All Opportunities →</Btn>
        </Card>
      </div>
    </div>
  );
}
