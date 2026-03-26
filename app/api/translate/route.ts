import { NextResponse } from "next/server";

type Tone = "professional" | "friendly" | "casual";

const toneGuide: Record<Tone, string> = {
  professional: "Professional and concise",
  friendly: "Warm, positive, and approachable",
  casual: "Light, short, and conversational",
};

function safeTone(input: string): Tone {
  if (input === "friendly" || input === "casual") return input;
  return "professional";
}

function mapUpstreamError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("insufficient") || msg.includes("quota") || msg.includes("balance")) {
    return "API balance/quota is insufficient. Please recharge or check account quota.";
  }
  if (msg.includes("model") && (msg.includes("not found") || msg.includes("does not exist") || msg.includes("unsupported"))) {
    return "Model is unavailable. Please verify OPENAI_MODEL and provider support.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "Upstream timeout. Please retry in a moment.";
  }
  if (msg.includes("unauthorized") || msg.includes("invalid api key") || msg.includes("authentication")) {
    return "API key is invalid or unauthorized. Please check OPENAI_API_KEY.";
  }
  return "LLM provider request failed. Please retry later.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String(body?.text ?? "").trim();
    const draftReply = String(body?.draftReply ?? "").trim();
    const tone = safeTone(String(body?.tone ?? "professional"));

    if (!text || text.length < 2 || text.length > 2000) {
      return NextResponse.json({ error: "Input must be 2-2000 characters." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const system = `You are a bilingual assistant for LinkedIn communication.
Return STRICT JSON only with keys: translation, suggestions, polishedReply.
Rules:
- translation: Chinese translation of user text.
- suggestions: exactly 3 English reply suggestions, tone = ${toneGuide[tone]}.
- polishedReply: If draftReply exists, polish it in English with the requested tone; otherwise generate one concise reply.
- No markdown, no extra keys.`;

    const user = `Source text:\n${text}\n\nTone: ${tone}\nDraft reply (optional):\n${draftReply || ""}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timer);
      if (e?.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout: provider took too long to respond." }, { status: 504 });
      }
      return NextResponse.json({ error: "Network error when calling model provider." }, { status: 502 });
    }
    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: mapUpstreamError(errText) }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output." }, { status: 502 });
    }

    const translation = String(parsed.translation || "").trim();
    const suggestionsRaw = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const suggestions = suggestionsRaw.slice(0, 3).map((x: any) => String(x).trim());
    const polishedReply = String(parsed.polishedReply || "").trim();

    if (!translation || suggestions.length !== 3 || !polishedReply) {
      return NextResponse.json({ error: "Model response missing required fields." }, { status: 502 });
    }

    return NextResponse.json({ translation, suggestions, polishedReply });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
