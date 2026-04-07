// src/components/ui.jsx
// Shared, reusable UI primitives — design system components
import { useState } from "react";
import { T, font, card, statusColor, RACI_COLOR, RACI_BG } from "../design.js";

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({children,style,onClick,hover}){
  const [hov,setHov]=useState(false);
  return(
    <div
      onClick={onClick}
      onMouseEnter={()=>hover&&setHov(true)}
      onMouseLeave={()=>hover&&setHov(false)}
      style={{...card,...style,cursor:onClick?"pointer":"default",
        boxShadow:hov?"0 8px 32px rgba(13,27,62,0.12)":card.boxShadow,
        transform:hov?"translateY(-1px)":"none",
        transition:"box-shadow 0.18s ease, transform 0.18s ease",
      }}>
      {children}
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
export function Metric({label,value,sub,icon,color,trend}){
  return(
    <div style={{...card,flex:1,minWidth:160}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{fontSize:11,color:T.textSoft,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
        {icon&&<div style={{width:34,height:34,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>}
      </div>
      <div style={{fontSize:26,fontWeight:700,color:color||T.text,fontFamily:font.display,lineHeight:1,marginBottom:4}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:T.textSoft,marginTop:4}}>{sub}</div>}
      {trend!=null&&(
        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8}}>
          <span style={{fontSize:11,color:trend>=0?T.green:T.red,fontWeight:600}}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>
          <span style={{fontSize:11,color:T.textSoft}}>vs last</span>
        </div>
      )}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({children,onClick,variant="primary",size="md",icon,disabled,style}){
  const [hov,setHov]=useState(false);
  const base={
    display:"inline-flex",alignItems:"center",gap:6,cursor:disabled?"not-allowed":"pointer",
    border:"none",fontFamily:font.body,fontWeight:600,transition:"all 0.15s ease",
    borderRadius:T.r,outline:"none",opacity:disabled?0.5:1,
    padding:size==="sm"?"6px 14px":size==="lg"?"12px 24px":"9px 18px",
    fontSize:size==="sm"?11:size==="lg"?14:12,
  };
  const variants={
    primary:{background:hov?T.blueDark:T.blue,color:"white",boxShadow:hov?"0 4px 16px rgba(77,147,248,0.4)":"0 2px 8px rgba(77,147,248,0.2)"},
    secondary:{background:hov?T.blueSoft:T.white,color:T.blueDark,border:`1px solid ${T.blueMid}`,boxShadow:T.shadow},
    ghost:{background:hov?T.border:"transparent",color:T.textMid,boxShadow:"none"},
    danger:{background:hov?"#DC2626":T.red,color:"white",boxShadow:"none"},
  };
  return(
    <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...base,...variants[variant],...style}} disabled={disabled}>
      {icon&&<span style={{fontSize:14}}>{icon}</span>}{children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({label,value,onChange,placeholder,type="text",prefix,style,small}){
  const [focus,setFocus]=useState(false);
  return(
    <div style={{marginBottom:small?0:12,...style}}>
      {label&&<div style={{fontSize:11,fontWeight:600,color:T.textMid,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
      <div style={{display:"flex",alignItems:"center",background:T.white,border:`1.5px solid ${focus?T.blue:T.border}`,borderRadius:T.r,transition:"border-color 0.15s",overflow:"hidden"}}>
        {prefix&&<span style={{padding:"0 10px",color:T.textSoft,fontSize:13,fontWeight:600,borderRight:`1px solid ${T.border}`,background:T.bg}}>{prefix}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{flex:1,padding:small?"6px 10px":"9px 12px",border:"none",outline:"none",fontSize:13,fontFamily:font.body,color:T.text,background:"transparent"}}/>
      </div>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({label,value,onChange,options,style}){
  return(
    <div style={{marginBottom:12,...style}}>
      {label&&<div style={{fontSize:11,fontWeight:600,color:T.textMid,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:T.r,fontSize:13,fontFamily:font.body,color:T.text,background:T.white,outline:"none",cursor:"pointer"}}>
        {options.map(o=>(<option key={o.value||o} value={o.value||o}>{o.label||o}</option>))}
      </select>
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
export function Slider({label,min,max,value,onChange,step=1,unit="",hint}){
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,color:T.textMid,fontWeight:500}}>{label}{hint&&<span style={{fontSize:10,color:T.textSoft,marginLeft:5}}>{hint}</span>}</span>
        <span style={{fontSize:12,fontWeight:700,color:T.blue}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:T.blue,cursor:"pointer",height:4}}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textSoft,marginTop:2}}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Badge / chip ────────────────────────────────────────────────────────────
export function Badge({label,color,bg,size="sm"}){
  return(
    <span style={{
      display:"inline-flex",alignItems:"center",
      background:bg||color+"18",color:color,
      border:`1px solid ${color}30`,
      borderRadius:100,padding:size==="sm"?"2px 10px":"4px 14px",
      fontSize:size==="sm"?10:11,fontWeight:600,whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

export function StatusBadge({status}){
  const s=statusColor(status);
  return<Badge label={status} color={s.text} bg={s.bg}/>;
}

export function RaciBadge({code}){
  return<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:6,background:RACI_BG[code]||T.border,color:RACI_COLOR[code]||T.textSoft,fontSize:10,fontWeight:800}}>{code}</span>;
}

// ─── Data table ──────────────────────────────────────────────────────────────
export function Table({headers,rows,onRowClick,compact,striped=true}){
  const [hov,setHov]=useState(-1);
  const p=compact?"6px 10px":"10px 14px";
  return(
    <div style={{overflowX:"auto",borderRadius:T.r,border:`1px solid ${T.border}`}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:compact?11:12,fontFamily:font.body}}>
        <thead>
          <tr style={{background:T.bg}}>
            {headers.map((h,i)=>(
              <th key={i} style={{padding:p,textAlign:i===0?"left":"center",fontWeight:700,fontSize:10,color:T.textSoft,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap",borderBottom:`1px solid ${T.border}`}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri}
              onMouseEnter={()=>onRowClick&&setHov(ri)}
              onMouseLeave={()=>setHov(-1)}
              onClick={()=>onRowClick&&onRowClick(ri)}
              style={{background:hov===ri&&onRowClick?T.blueSoft:striped&&ri%2===1?T.bg:T.white,cursor:onRowClick?"pointer":"default",transition:"background 0.12s"}}>
              {row.map((cell,ci)=>(
                <td key={ci} style={{padding:p,textAlign:ci===0?"left":"center",borderBottom:`1px solid ${T.border}`,color:T.text,verticalAlign:"middle"}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHead({title,sub,action}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:font.display}}>{title}</div>
        {sub&&<div style={{fontSize:13,color:T.textSoft,marginTop:2}}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function Progress({value,max,color,label,height=6}){
  return(
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMid,marginBottom:4}}><span>{label}</span><span style={{fontWeight:600}}>{Math.round(value/max*100)}%</span></div>}
      <div style={{height,background:T.border,borderRadius:100,overflow:"hidden"}}>
        <div style={{height:"100%",width:Math.min(100,value/max*100)+"%",background:color||T.blue,borderRadius:100,transition:"width 0.4s ease"}}/>
      </div>
    </div>
  );
}

// ─── Tabs (horizontal pill style) ────────────────────────────────────────────
export function Tabs({tabs,active,onChange}){
  return(
    <div style={{display:"flex",gap:4,background:T.bg,padding:4,borderRadius:T.r,border:`1px solid ${T.border}`,flexWrap:"wrap"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:font.body,fontWeight:600,fontSize:12,
            background:active===t.id?T.white:T.bg,
            color:active===t.id?T.blue:T.textSoft,
            boxShadow:active===t.id?T.shadow:"none",
            transition:"all 0.15s",
          }}>{t.icon&&<span style={{marginRight:5}}>{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function Empty({icon="📭",title,sub,action}){
  return(
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:T.textSoft,marginBottom:20}}>{sub}</div>}
      {action}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({open,onClose,title,children,width=500}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(13,27,62,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:T.white,borderRadius:T.rLg,boxShadow:T.shadowLg,width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:font.display}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.textSoft,lineHeight:1,padding:4}}>×</button>
        </div>
        <div style={{padding:"22px"}}>{children}</div>
      </div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({style}){return<div style={{height:1,background:T.border,...style}}/>;}

// ─── Search input ────────────────────────────────────────────────────────────
export function Search({value,onChange,placeholder="Search..."}){
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <span style={{position:"absolute",left:10,fontSize:14,color:T.textSoft}}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{padding:"8px 12px 8px 32px",border:`1.5px solid ${T.border}`,borderRadius:T.r,fontSize:12,fontFamily:font.body,color:T.text,background:T.white,outline:"none",width:220}}/>
    </div>
  );
}

// ─── Tooltip-like info row ────────────────────────────────────────────────────
export function InfoRow({label,value,mono}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:12,color:T.textSoft}}>{label}</span>
      <span style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:mono?font.mono:font.body}}>{value}</span>
    </div>
  );
}

// ─── Chart: vertical bars ─────────────────────────────────────────────────────
export function BarChart({data,keys,colors,labels,height=200,sym=""}){
  const allVals=data.flatMap(d=>keys.map(k=>d[k]||0));
  const maxV=Math.max(...allVals,1);
  const groupW=100/data.length;
  const barW=groupW*0.35;
  return(
    <div style={{position:"relative",height,marginTop:8}}>
      {/* Y grid lines */}
      {[0,0.25,0.5,0.75,1].map(f=>(
        <div key={f} style={{position:"absolute",bottom:f*height,left:0,right:0,borderTop:`1px dashed ${T.border}`,display:"flex",alignItems:"center"}}>
          <span style={{fontSize:9,color:T.textSoft,marginLeft:-36,width:34,textAlign:"right",transform:"translateY(-50%)"}}>
            {maxV*f>=1000000?(maxV*f/1000000).toFixed(1)+"M":maxV*f>=1000?(maxV*f/1000).toFixed(0)+"K":Math.round(maxV*f)}
          </span>
        </div>
      ))}
      {/* Bars */}
      <div style={{display:"flex",alignItems:"flex-end",height:"100%",gap:0,paddingLeft:40}}>
        {data.map((d,di)=>(
          <div key={di} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:"100%",width:"80%",justifyContent:"center"}}>
              {keys.map((k,ki)=>{
                const h=(d[k]||0)/maxV*100;
                return(
                  <div key={k} title={labels[ki]+": "+(sym||(d[k]||0).toLocaleString())}
                    style={{flex:1,height:h+"%",background:colors[ki],borderRadius:"3px 3px 0 0",minHeight:2,transition:"height 0.4s ease",cursor:"default"}}/>
                );
              })}
            </div>
            <div style={{fontSize:10,color:T.textSoft,marginTop:4,whiteSpace:"nowrap"}}>{d.label}</div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{display:"flex",gap:14,marginTop:12,flexWrap:"wrap"}}>
        {keys.map((k,ki)=>(<div key={k} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:colors[ki]}}/><span style={{fontSize:10,color:T.textSoft}}>{labels[ki]}</span></div>))}
      </div>
    </div>
  );
}

// ─── Chart: horizontal shore breakdown bar ────────────────────────────────────
export function ShoreBar({data,sym=""}){
  const total=data.reduce((s,d)=>s+d.val,0)||1;
  return(
    <div>
      <div style={{display:"flex",borderRadius:6,overflow:"hidden",height:24,marginBottom:10,gap:1}}>
        {data.filter(d=>d.val>0).map((d,i)=>(
          <div key={i} title={d.label+": "+sym+Math.round(d.val/1000)+"K"}
            style={{width:(d.val/total*100)+"%",background:d.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",fontWeight:700,minWidth:d.val/total>0.06?30:0,overflow:"hidden",transition:"width 0.4s"}}>
            {d.val/total>0.08?Math.round(d.val/total*100)+"%":""}
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px"}}>
        {data.filter(d=>d.val>0).map(d=>(<div key={d.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:d.color}}/><span style={{fontSize:11,color:T.textMid}}>{d.label}</span><span style={{fontSize:11,fontWeight:700,color:d.color}}>{sym}{Math.round(d.val/1000)}K</span></div>))}
      </div>
    </div>
  );
}

// ─── Donut chart (CSS-based) ──────────────────────────────────────────────────
export function DonutChart({data,size=120}){
  const total=data.reduce((s,d)=>s+d.val,0)||1;
  let offset=0;
  const r=40,cx=50,cy=50,circum=2*Math.PI*r;
  return(
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={16}/>
      {data.filter(d=>d.val>0).map((d,i)=>{
        const pct=d.val/total;
        const dash=pct*circum;
        const el=(<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={16}
          strokeDasharray={`${dash} ${circum-dash}`}
          strokeDashoffset={-offset*circum}
          transform="rotate(-90 50 50)"/>);
        offset+=pct;
        return el;
      })}
    </svg>
  );
}
