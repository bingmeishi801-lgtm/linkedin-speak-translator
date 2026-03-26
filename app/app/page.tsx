"use client";
import { useState } from "react";

type Resp = { translation:string; suggestions:string[]; polishedReply:string };

export default function AppPage(){
  const [text,setText]=useState("");
  const [tone,setTone]=useState("professional");
  const [loading,setLoading]=useState(false);
  const [data,setData]=useState<Resp|null>(null);

  const run = async()=>{
    if(text.trim().length<2){ alert("Please input at least 2 chars"); return; }
    setLoading(true);
    try{
      const res=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,tone})});
      const json=await res.json();
      setData(json);
      const key='lst_history';
      const old=JSON.parse(localStorage.getItem(key)||'[]');
      const next=[{time:Date.now(),text,...json},...old].slice(0,20);
      localStorage.setItem(key,JSON.stringify(next));
    }finally{ setLoading(false); }
  }

  return <main className="container grid">
    <section className="card grid">
      <h2>Translator Workspace</h2>
      <textarea className="textarea" rows={6} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste LinkedIn content..." />
      <div className="row">
        <select value={tone} onChange={e=>setTone(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
        </select>
        <button className="btn btn-primary" onClick={run} disabled={loading}>{loading?'Processing...':'Translate & Suggest'}</button>
      </div>
    </section>

    {data && <section className="card grid">
      <h3>Translation</h3><div className="suggestion">{data.translation}</div>
      <h3>Suggestions</h3>
      {data.suggestions.map((s,i)=><div className="suggestion" key={i}>{s}</div>)}
      <h3>Polished Reply</h3><div className="suggestion">{data.polishedReply}</div>
    </section>}
  </main>
}
