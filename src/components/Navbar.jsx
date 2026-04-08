// src/components/Navbar.jsx
import { T, font } from "../design.js";
import { Btn } from "./ui.jsx";

const PAGE_TITLES = {
  dashboard:"Dashboard Overview", opportunities:"Opportunities",
  analytics:"Analytics", cost:"Cost & Pricing",
  team:"Team Mix", ai:"AI & Enablers",
  kt:"KT & Steady State", raci:"RACI & Risk",
};

export default function Navbar({page,opp,onSave,onExport,saving,currency,onCurrencyToggle,fxRate,fxUpdated,fxLoading,onRefreshFx,onEdit,exporting}){
  const isFx = currency==="GBP";
  return(
    <div style={{height:58,background:T.white,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 20px",gap:12,position:"sticky",top:0,zIndex:90,boxShadow:"0 1px 4px rgba(13,27,62,0.05)",flexShrink:0}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:font.display}}>{PAGE_TITLES[page]||"—"}</div>
        {opp?.client&&<div style={{fontSize:11,color:T.textSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{opp.client}{opp.clientCity?" · "+opp.clientCity:""}</div>}
      </div>

      {/* FX rate indicator */}
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:T.r,background:isFx?T.blueSoft:T.bg,border:`1px solid ${isFx?T.blue:T.border}`}}>
        <button onClick={onCurrencyToggle}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:isFx?T.blue:T.textMid,fontFamily:font.body,padding:0}}>
          {currency==="USD"?"$ USD":"£ GBP"}
        </button>
        {fxRate&&(
          <span style={{fontSize:9,color:T.textSoft,borderLeft:`1px solid ${T.border}`,paddingLeft:6}}>
            1 USD = {fxRate.toFixed(4)} GBP
            {fxUpdated&&<span style={{marginLeft:4,color:T.textSoft}}>· {fxUpdated}</span>}
          </span>
        )}
        <button onClick={onRefreshFx} title="Refresh exchange rate"
          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:T.textSoft,padding:0,lineHeight:1,animation:fxLoading?"spin 0.8s linear infinite":"none"}}>
          ↺
        </button>
      </div>

      {opp&&page==="dashboard"&&(
        <Btn size="sm" variant="secondary" icon="✏️" onClick={onEdit}>Edit</Btn>
      )}

      <Btn size="sm" variant={exporting==="pdf"?"primary":"secondary"} icon={exporting==="pdf"?"⏳":"⬇"} onClick={()=>!exporting&&onExport("pdf")} disabled={!!exporting}>
        {exporting==="pdf"?"Generating...":"PDF"}
      </Btn>
      <Btn size="sm" variant={exporting==="pptx"?"primary":"secondary"} icon={exporting==="pptx"?"⏳":"📊"} onClick={()=>!exporting&&onExport("pptx")} disabled={!!exporting}>
        {exporting==="pptx"?"Generating...":"PPTX"}
      </Btn>
      <Btn size="sm" variant="primary" icon="✓" onClick={onSave} disabled={saving}>{saving?"Saving...":"Save"}</Btn>
    </div>
  );
}
