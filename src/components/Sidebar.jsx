// src/components/Sidebar.jsx
import { T, font } from "../design.js";

const NAV = [
  {id:"dashboard",    icon:"⊞",  label:"Dashboard"},
  {id:"opportunities",icon:"◈",  label:"Opportunities"},
  {id:"analytics",    icon:"∿",  label:"Analytics"},
  {id:"cost",         icon:"◎",  label:"Cost & Pricing"},
  {id:"team",         icon:"⬡",  label:"Team Mix"},
  {id:"ai",           icon:"⚡",  label:"AI & Enablers"},
  {id:"kt",           icon:"⟳",  label:"KT & Steady State"},
  {id:"raci",         icon:"⊛",  label:"RACI & Risk"},
];

export default function Sidebar({page,onPage,opp}){
  return(
    <div style={{
      width:220,flexShrink:0,height:"100vh",position:"sticky",top:0,
      background:"#0D1B3E",display:"flex",flexDirection:"column",
      boxShadow:"2px 0 20px rgba(0,0,0,0.15)",zIndex:100,
    }}>
      {/* Logo */}
      <div style={{padding:"24px 20px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#4D93F8,#2A51C1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white",fontWeight:800}}>G</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"white",letterSpacing:"0.01em",fontFamily:font.display}}>GW AMS</div>
            <div style={{fontSize:10,color:"#4D93F8",fontWeight:600}}>NTT DATA</div>
          </div>
        </div>
      </div>

      {/* Current opportunity pill */}
      {opp&&(
        <div style={{margin:"0 12px 16px",background:"rgba(77,147,248,0.12)",border:"1px solid rgba(77,147,248,0.25)",borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:9,color:"#4D93F8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Active</div>
          <div style={{fontSize:11,fontWeight:700,color:"white",lineHeight:1.3}}>{opp.name||"Untitled"}</div>
          {opp.client&&<div style={{fontSize:10,color:"#8B94B3",marginTop:1}}>{opp.client}</div>}
        </div>
      )}

      {/* Nav items */}
      <nav style={{flex:1,padding:"0 10px",overflowY:"auto"}}>
        {NAV.map(item=>{
          const active=page===item.id;
          return(
            <button key={item.id} onClick={()=>onPage(item.id)}
              style={{
                width:"100%",display:"flex",alignItems:"center",gap:10,
                padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",
                marginBottom:2,textAlign:"left",fontFamily:font.body,
                background:active?"rgba(77,147,248,0.18)":"transparent",
                color:active?"#4D93F8":"#8B94B3",
                fontWeight:active?700:500,fontSize:13,
                transition:"all 0.15s",
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="#C4D4F0";}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#8B94B3";}}}>
              <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              <span>{item.label}</span>
              {active&&<div style={{marginLeft:"auto",width:3,height:16,borderRadius:2,background:"#4D93F8"}}/>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontSize:10,color:"#3D4F7C",textAlign:"center"}}>Guidewire Practice · Confidential</div>
      </div>
    </div>
  );
}
