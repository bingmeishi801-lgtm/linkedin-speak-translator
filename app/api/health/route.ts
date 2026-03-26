import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "MISSING_KEY",
        message: "OPENAI_API_KEY is not configured.",
      },
      { status: 500 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 10,
        messages: [{ role: "user", content: "reply with ok" }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const raw = (await res.text()).toLowerCase();
      if (raw.includes("insufficient") || raw.includes("quota") || raw.includes("balance")) {
        return NextResponse.json({ ok: false, code: "INSUFFICIENT_QUOTA", message: "API balance/quota is insufficient." }, { status: 502 });
      }
      if (raw.includes("invalid api key") || raw.includes("unauthorized") || raw.includes("authentication")) {
        return NextResponse.json({ ok: false, code: "INVALID_KEY", message: "API key is invalid or unauthorized." }, { status: 502 });
      }
      if (raw.includes("model") && (raw.includes("not found") || raw.includes("unsupported") || raw.includes("does not exist"))) {
        return NextResponse.json({ ok: false, code: "MODEL_UNAVAILABLE", message: "Model is unavailable on current provider." }, { status: 502 });
      }
      return NextResponse.json({ ok: false, code: "UPSTREAM_ERROR", message: "Provider request failed." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, code: "OK", message: "Key and model are available.", model, baseUrl });
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      return NextResponse.json({ ok: false, code: "TIMEOUT", message: "Provider timeout." }, { status: 504 });
    }
    return NextResponse.json({ ok: false, code: "NETWORK_ERROR", message: "Network error when contacting provider." }, { status: 502 });
  }
}
