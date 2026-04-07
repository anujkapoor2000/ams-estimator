// src/pages/DashboardPage.jsx
import { T, font } from "../design.js";
import { Card, Metric, BarChart, ShoreBar, StatusBadge, Progress, SectionHead, Btn } from "../components/ui.jsx";
import { LOCATIONS, buildPlan, blendedCostRate, blendedSellRate, splitFTE, calcBase, AI_GAIN_CURVE, FTE_HRS } from "../store/appData.js";

export default function DashboardPage({opp,opps,onPage,sym}){
  if(!opp) return(
    <div style={{padding:40,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>📋</div>
      <div style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>No opportunity selected</div>
      <div style={{fontSize:13,color:T.textSoft,marginBottom:24}}>Select or create an opportunity to view its dashboard</div>
      <Btn onClick={()=>onPage("opportunities")}>Go to Opportunities</Btn>
    </div>
  );

  const {ls,rates,margins,fixedSell,mods,intgs,spY,spS,ktMo,calMo,totalYrs,avgL2,avgL3,tkt,cont} = opp;
  const intgHrs=(intgs||[]).length*60;
  const base=calcBase(mods||[],spS,spY,avgL2,avgL3,tkt);
  const blendC=blendedCostRate(ls,rates);
  const blendS=blendedSellRate(ls,rates,margins,fixedSell);
  const plan=buildPlan(base,intgHrs,ktMo,calMo,totalYrs,blendC,blendS,cont);
  const totSell=plan.reduce((s,r)=>s+r.sellWC,0);
  const totCost=plan.reduce((s,r)=>s+r.costWC,0);
  const totMargin=totSell-totCost;
  const totHrs=plan.reduce((s,r)=>s+r.totalH,0);
  const annualBase=base.totalL2+base.totalL3+base.totalEnh+intgHrs;
  const totalFTE=Math.round(annualBase/FTE_HRS*10)/10;
  const blendedMarginPct=blendS>0?Math.round((blendS-blendC)/blendS*100):0;
  const locFTEs=splitFTE(totalFTE,ls);
  const hrsNoAI=annualBase*totalYrs;
  const hrsSaved=hrsNoAI-totHrs;

  const shoreRevData=LOCATIONS.filter(l=>ls[l.key]>0).map(l=>{
    const sr=fixedSell[l.key]!=null?fixedSell[l.key]:rates[l.key]*(1+(margins[l.key]/100));
    return{label:l.label,val:Math.round(locFTEs[l.key]*sr*FTE_HRS),color:l.color};
  });

  const pipelineStats={
    total:opps.length,
    active:opps.filter(o=>o.status==="Active").length,
    won:opps.filter(o=>o.status==="Won").length,
    totalValue:opps.reduce((s,o)=>s+(o.value||0),0),
  };

  return(
    <div style={{padding:"28px 28px 40px"}}>

      {/* Overview band */}
      <div style={{background:"linear-gradient(135deg,#0D1B3E 0%,#1A3A9F 60%,#2A51C1 100%)",borderRadius:T.rLg,padding:"24px 28px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Engagement Overview</div>
          <div style={{color:"white",fontSize:24,fontWeight:800,fontFamily:font.display}}>{opp.name}</div>
          <div style={{color:"#7BA7F8",fontSize:13,marginTop:3}}>{opp.client}{opp.clientCity?" · "+opp.clientCity:""} · {totalYrs}-Year Plan</div>
        </div>
        <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
          {[
            {l:"Total Sell",v:sym+(totSell/1000000).toFixed(2)+"M",c:"white"},
            {l:"Gross Margin",v:sym+(totMargin/1000).toFixed(0)+"K",c:"#4ADBA2"},
            {l:"Margin %",v:blendedMarginPct+"%",c:"#4ADBA2"},
            {l:"Team Size",v:totalFTE+" FTEs",c:"#7BA7F8"},
          ].map(item=>(<div key={item.l} style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>{item.l}</div><div style={{fontSize:20,fontWeight:700,color:item.c,fontFamily:font.display}}>{item.v}</div></div>))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <Metric label="Total Sell Price" value={sym+(totSell/1000000).toFixed(2)+"M"} sub={"incl. "+cont+"% contingency"} icon="💰" color={T.blue}/>
        <Metric label="Total Cost" value={sym+(totCost/1000000).toFixed(2)+"M"} sub="NTT DATA delivery cost" icon="📉" color={T.blueDark}/>
        <Metric label="Gross Margin" value={sym+(totMargin/1000).toFixed(0)+"K"} sub={blendedMarginPct+"% blended"} icon="📈" color={T.green}/>
        <Metric label="Hours Saved by AI" value={hrsSaved.toLocaleString()} sub={"over "+totalYrs+" years"} icon="⚡" color={T.purple}/>
        <Metric label="FTEs" value={totalFTE} sub="steady-state baseline" icon="👥" color={T.teal}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        {/* Cost vs Sell chart */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Cost vs Sell by Year</div>
          <div style={{fontSize:12,color:T.textSoft,marginBottom:16}}>With contingency applied</div>
          <BarChart
            data={plan.map(r=>({label:"Y"+r.yr,cost:r.costWC,sell:r.sellWC}))}
            keys={["cost","sell"]}
            colors={[T.blueDark,T.blue]}
            labels={["Cost","Sell"]}
            height={180} sym={sym}/>
        </Card>

        {/* AI savings chart */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>AI Efficiency Gains</div>
          <div style={{fontSize:12,color:T.textSoft,marginBottom:16}}>Hours with vs without AI per year</div>
          <BarChart
            data={plan.map(r=>({label:"Y"+r.yr,noai:r.noAiHrs,ai:r.totalH}))}
            keys={["noai","ai"]}
            colors={[T.border.replace("#","")?"#D1D9EE":T.border,T.teal]}
            labels={["No AI","With AI"]}
            height={180} sym=""/>
          <div style={{marginTop:10,padding:"8px 12px",background:T.tealSoft,borderRadius:T.r}}>
            <span style={{fontSize:12,color:T.teal,fontWeight:600}}>{sym}{Math.round(hrsSaved*blendC/1000)}K cost saving across {totalYrs} years from AI gains</span>
          </div>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        {/* Shore breakdown */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Revenue by Delivery Shore</div>
          <div style={{fontSize:12,color:T.textSoft,marginBottom:16}}>Annual sell revenue split</div>
          <ShoreBar data={shoreRevData} sym={sym}/>
          <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:6}}>
            {LOCATIONS.filter(l=>ls[l.key]>0&&locFTEs[l.key]>0).map(l=>{
              const sr=fixedSell[l.key]!=null?fixedSell[l.key]:rates[l.key]*(1+(margins[l.key]/100));
              const margin=Math.round(sr-rates[l.key]);
              return(<div key={l.key} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:2,background:l.color,flexShrink:0}}/>
                <span style={{fontSize:12,color:T.text,flex:1}}>{l.flag} {l.label}</span>
                <span style={{fontSize:11,color:T.textSoft}}>{locFTEs[l.key]} FTE</span>
                <span style={{fontSize:11,fontWeight:600,color:l.color}}>{sym}{Math.round(sr)}/hr sell</span>
                <span style={{fontSize:10,color:T.green,fontWeight:600}}>+{sym}{margin}</span>
              </div>);
            })}
          </div>
        </Card>

        {/* Year plan summary */}
        <Card>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Year-by-Year Plan</div>
          <div style={{fontSize:12,color:T.textSoft,marginBottom:16}}>{totalYrs}-year engagement summary</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {plan.map(r=>{
              const pct=Math.round(r.sellWC/totSell*100);
              return(<div key={r.yr} style={{padding:"10px 12px",background:T.bg,borderRadius:T.r,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>Year {r.yr}</span>
                    <span style={{fontSize:10,color:T.textSoft,marginLeft:8}}>
                      {r.ktH>0?"KT · ":""}{r.calH>0?"Cal · ":""}{r.ssH>0?"Steady-State":""}
                    </span>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{sym}{(r.sellWC/1000).toFixed(0)}K</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{flex:1,height:5,background:T.border,borderRadius:100,overflow:"hidden"}}>
                    <div style={{height:"100%",width:pct+"%",background:T.blue,borderRadius:100}}/>
                  </div>
                  <span style={{fontSize:10,color:T.textSoft,flexShrink:0}}>{r.totalH.toLocaleString()} hrs</span>
                  <span style={{fontSize:10,color:T.green,fontWeight:600,flexShrink:0}}>AI: -{r.aiGainPct}%</span>
                </div>
              </div>);
            })}
          </div>
        </Card>
      </div>

      {/* Pipeline summary strip */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>Pipeline Overview</div>
            <div style={{fontSize:12,color:T.textSoft}}>{pipelineStats.total} opportunities tracked</div>
          </div>
          <div style={{display:"flex",gap:24}}>
            {[{l:"Total",v:pipelineStats.total,c:T.blue},{l:"Active",v:pipelineStats.active,c:T.green},{l:"Won",v:pipelineStats.won,c:T.teal},{l:"Pipeline Value",v:sym+(pipelineStats.totalValue/1000000).toFixed(1)+"M",c:T.purple}].map(s=>(<div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:10,color:T.textSoft,marginBottom:2}}>{s.l}</div><div style={{fontSize:18,fontWeight:700,color:s.c,fontFamily:font.display}}>{s.v}</div></div>))}
          </div>
          <Btn size="sm" variant="secondary" onClick={()=>onPage("opportunities")}>View All →</Btn>
        </div>
      </Card>
    </div>
  );
}
