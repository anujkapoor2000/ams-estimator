// src/components/Navbar.jsx
import { T, font } from "../design.js";
import { Btn } from "./ui.jsx";

const PAGE_TITLES = {
  dashboard:"Dashboard Overview",
  opportunities:"Opportunities",
  analytics:"Analytics",
  cost:"Cost & Pricing",
  team:"Team Mix",
  ai:"AI & Enablers",
  kt:"KT & Steady State",
  raci:"RACI & Risk",
};

export default function Navbar({page,opp,onSave,onExport,saving,currency,onCurrencyToggle}){
  const sym=currency==="USD"?"$":"£";
  return(
    <div style={{
      height:58,background:T.white,borderBottom:`1px solid ${T.border}`,
      display:"flex",alignItems:"center",padding:"0 24px",gap:16,
      position:"sticky",top:0,zIndex:90,boxShadow:"0 1px 4px rgba(13,27,62,0.05)",
    }}>
      {/* Page title */}
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:font.display}}>{PAGE_TITLES[page]||"—"}</div>
        {opp?.client&&<div style={{fontSize:11,color:T.textSoft}}>{opp.client}{opp.clientCity?" · "+opp.clientCity:""}</div>}
      </div>

      {/* Actions */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>

        {/* Currency toggle */}
        <button onClick={onCurrencyToggle}
          style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${T.border}`,background:T.bg,fontFamily:font.body,fontSize:11,fontWeight:700,color:T.textMid,cursor:"pointer"}}>
          {currency==="USD"?"$ USD":"£ GBP"}
        </button>

        {/* Export buttons */}
        <Btn size="sm" variant="secondary" icon="⬇" onClick={()=>onExport("pdf")}>PDF</Btn>
        <Btn size="sm" variant="secondary" icon="📊" onClick={()=>onExport("pptx")}>PPTX</Btn>

        {/* Save */}
        <Btn size="sm" variant="primary" icon="✓" onClick={onSave} disabled={saving}>
          {saving?"Saving...":"Save"}
        </Btn>
      </div>
    </div>
  );
}
