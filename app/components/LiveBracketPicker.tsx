"use client";
import {useState} from "react";
import type {EventData} from "../lib/data";
export function LiveBracketPicker({events,onChange}:{events:EventData[];onChange:(events:EventData[])=>void}){
 const brackets=events.filter(e=>e.bracket);
 const current=brackets.filter(e=>e.isLive).map(e=>e.id);
 const[draft,setDraft]=useState<number[]|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const chosen=draft??current;
 if(!brackets.length)return null;
 async function save(){setBusy(true);setError("");try{const r=await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"setLiveBrackets",eventIds:chosen})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not update live brackets");onChange(data.events);setDraft(null)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <section className="liveBracketSettings adminCard"><h2>Live knockout brackets</h2><p>Manage existing category brackets here. Add a new category using “Add category bracket” below. Unselected brackets move to the archive; their competitors and results are preserved.</p><div className="liveBracketChoices">{brackets.map(e=><label key={e.id}><input type="checkbox" checked={chosen.includes(e.id)} disabled={busy||(!chosen.includes(e.id)&&chosen.length>=4)} onChange={change=>setDraft(change.target.checked?[...chosen,e.id]:chosen.filter(id=>id!==e.id))}/><span><b>{e.category}</b><small>{e.title} · {e.bracket?.size} competitors · {e.eventDate}</small></span></label>)}</div>{error&&<p role="alert">{error}</p>}<button className="secondary" type="button" disabled={busy||chosen.length<1||chosen.length>4} onClick={save}>{busy?"Saving…":"Show selected brackets live"}</button><span> {chosen.length} / 4 selected</span></section>;
}
