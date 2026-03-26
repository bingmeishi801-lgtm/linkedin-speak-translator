import { NextResponse } from "next/server";

function toChinese(text:string){ return `【译】${text}` }

export async function POST(req:Request){
  const { text, tone } = await req.json();
  const t = String(text||"").trim();
  if(t.length<2 || t.length>2000){
    return NextResponse.json({ error:"invalid_length" },{ status:400 });
  }
  await new Promise(r=>setTimeout(r,1200));
  return NextResponse.json({
    translation: toChinese(t),
    suggestions: [
      `(${tone}) Thanks for sharing this insight — very helpful.`,
      `(${tone}) Great point. I'd love to hear more about your approach.`,
      `(${tone}) This resonates with my recent experience in product building.`
    ],
    polishedReply: `(${tone}) Thanks for posting this — really useful perspective.`
  });
}
