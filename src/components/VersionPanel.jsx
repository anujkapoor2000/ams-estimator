// src/components/VersionPanel.jsx
// Shows version history for the current opportunity with promote button
import { useState, useEffect } from "react";
import { T, font } from "../design.js";
import { VERSION_LABELS, nextVersion, versionColor } from "../store/appData.js";
import { Btn } from "./ui.jsx";

export default function VersionPanel({opp,onPromote,onLoadVersion}){
  const [versions,setVersions]=useState([]);
  const [loading,setLoading]=useState(false);
  const [open,setOpen]=useState(false);

  async function fetchVersions(){
    if(!opp?.id)return;
    setLoading(true);
    try{
      const r=await fetch("/api/engagements?id="+opp.id+"&versions=1");
      if(r.ok){const d=await r.json();setVersions(d.versions||[]);}
    }finally{setLoading(false);}
  }

  useEffect(()=>{if(open)fetchVersions();},[open,opp?.id]);

  const next=nextVersion(opp?.version||"Draft");
  const isAtFinal=opp?.version==="Final";
  const col=versionColor(opp?.version||"Draft");
  const nextCol=versionColor(next);

  return(
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:100,border:`1px solid ${col}40`,background:col+"15",cursor:"pointer",fontFamily:font.body}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:col}}/>
        <span style={{fontSize:11,fontWeight:700,color:col}}>{opp?.version||"Draft"}</span>
        <span style={{fontSize:10,color:T.textSoft}}>▾</span>
      </button>

      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,width:320,background:T.white,borderRadius:T.rMd,border:`1px solid ${T.border}`,boxShadow:"0 8px 32px rgba(13,27,62,0.14)",zIndex:200,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Version History</div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSoft,fontSize:16}}>×</button>
          </div>

          {/* Version progression */}
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}>
              {VERSION_LABELS.map((v,i)=>{
                const done=VERSION_LABELS.indexOf(opp?.version||"Draft")>=i;
                const vc=versionColor(v);
                return(<>
                  <div key={v} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:done?vc:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",fontWeight:700}}>
                      {done?"✓":i+1}
                    </div>
                    <span style={{fontSize:9,fontWeight:done?700:400,color:done?vc:T.textSoft}}>{v}</span>
                  </div>
                  {i<VERSION_LABELS.length-1&&<div style={{flex:1,height:1,background:done&&VERSION_LABELS.indexOf(opp?.version||"Draft")>i?vc:T.border}}/>}
                </>);
              })}
            </div>
            {!isAtFinal?(
              <Btn size="sm" onClick={()=>{onPromote(next);setOpen(false);}} style={{width:"100%",justifyContent:"center"}}>
                Promote to {next} →
              </Btn>
            ):(
              <div style={{textAlign:"center",fontSize:11,color:"#10B981",fontWeight:600,padding:"4px 0"}}>✓ Final version — engagement locked</div>
            )}
          </div>

          {/* Saved snapshots */}
          <div style={{padding:"10px 16px",maxHeight:200,overflowY:"auto"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textSoft,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Saved Snapshots</div>
            {loading?<div style={{fontSize:11,color:T.textSoft,textAlign:"center",padding:8}}>Loading...</div>
            :versions.length===0?<div style={{fontSize:11,color:T.textSoft,textAlign:"center",padding:8}}>No saved versions yet</div>
            :versions.map(v=>(
              <div key={v.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:24,height:24,borderRadius:6,background:versionColor(v.version_label)+"20",color:versionColor(v.version_label),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{v.version_label}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.text}}>{v.version_label}</div>
                  <div style={{fontSize:9,color:T.textSoft}}>{new Date(v.saved_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <button onClick={()=>{if(v.payload)onLoadVersion(v.payload);setOpen(false);}}
                  style={{fontSize:10,color:T.blue,fontWeight:600,background:"none",border:`1px solid ${T.blueMid}`,borderRadius:4,padding:"2px 8px",cursor:"pointer"}}>Load</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
