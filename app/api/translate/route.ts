import { NextResponse } from "next/server";

type Tone = "professional" | "friendly" | "casual";

const toneGuide: Record<Tone, string> = {
  professional: "Professional and concise",
  friendly: "Warm, positive, and approachable",
  casual: "Light, short, and conversational",
};

function fakeTranslateToZh(text: string): string {
  return `【中文翻译】${text}`;
}

function buildSuggestions(text: string, tone: Tone): string[] {
  const prefix = toneGuide[tone];
  return [
    `${prefix}: Thanks for sharing this — I found your point about "${text.slice(0, 28)}" really practical.`,
    `${prefix}: Great perspective. I’m applying a similar approach in my current workflow, and it works well.`,
    `${prefix}: Appreciate this insight. Curious—what metric do you use to validate this strategy?`,
  ];
}

function polishReply(draftReply: string, tone: Tone): string {
  if (!draftReply.trim()) {
    return `${toneGuide[tone]}: Thanks for posting this. Super helpful perspective and very actionable.`;
  }
  return `${toneGuide[tone]}: ${draftReply.trim()}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String(body?.text ?? "").trim();
    const draftReply = String(body?.draftReply ?? "");
    const tone = (String(body?.tone ?? "professional") as Tone);

    if (!text || text.length < 2 || text.length > 2000) {
      return NextResponse.json({ error: "Input must be 2-2000 characters." }, { status: 400 });
    }
    if (!["professional", "friendly", "casual"].includes(tone)) {
      return NextResponse.json({ error: "Invalid tone." }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 1200));

    return NextResponse.json({
      translation: fakeTranslateToZh(text),
      suggestions: buildSuggestions(text, tone),
      polishedReply: polishReply(draftReply, tone),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
