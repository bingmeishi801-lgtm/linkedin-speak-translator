"use client";

import { useEffect, useMemo, useState } from "react";

type Tone = "professional" | "friendly" | "casual";
type Resp = {
  translation: string;
  suggestions: string[];
  polishedReply: string;
};
type HistoryItem = Resp & {
  id: string;
  text: string;
  tone: Tone;
  createdAt: number;
};

const HISTORY_KEY = "lst_history_v1";

const INPUT_TEMPLATES = [
  {
    key: "comment-reply",
    label: "评论回复",
    text: "Great post. I especially liked your point on balancing speed and quality in product iteration. What metric do you prioritize first when trade-offs happen?",
  },
  {
    key: "dm-reply",
    label: "私信回复",
    text: "Hi [Name], thanks for reaching out. I’m currently exploring AI product opportunities in global markets. Happy to connect and exchange ideas.",
  },
  {
    key: "job-outreach",
    label: "求职沟通",
    text: "Hi [Name], I’ve been following your work on [Company/Product]. I’m interested in roles related to AI product building and growth. Would love to learn more about your team’s priorities.",
  },
];

export default function AppPage() {
  const [text, setText] = useState("");
  const [draftReply, setDraftReply] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Resp | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as HistoryItem[];
      setHistory(parsed);
    } catch {
      setHistory([]);
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  };

  const canSubmit = useMemo(() => {
    const len = text.trim().length;
    return len >= 2 && len <= 2000;
  }, [text]);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setToast("Copied ✓");
    setTimeout(() => setCopiedKey(""), 1800);
    setTimeout(() => setToast(""), 1800);
  };

  const applyTemplate = (value: string) => {
    setText(value);
    setError(null);
  };

  const run = async () => {
    if (!canSubmit) {
      setError("Input must be between 2 and 2000 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone, draftReply }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Request failed");
        return;
      }
      setData(json);

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        text,
        tone,
        translation: json.translation,
        suggestions: json.suggestions,
        polishedReply: json.polishedReply,
        createdAt: Date.now(),
      };
      const next = [item, ...history].slice(0, 20);
      saveHistory(next);
      setActiveHistoryId(item.id);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("Request timeout: model response took too long, please retry.");
      } else {
        setError("Network error, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const useHistory = (item: HistoryItem) => {
    setText(item.text);
    setTone(item.tone);
    setData({
      translation: item.translation,
      suggestions: item.suggestions,
      polishedReply: item.polishedReply,
    });
    setActiveHistoryId(item.id);
  };

  const removeHistory = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    saveHistory(next);
    if (activeHistoryId === id) setActiveHistoryId("");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-title">LinkedIn Speak Translator</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">UI V2 · Better look, same core flow</h1>
          <p className="mt-2 text-sm text-slate-300">Translate, generate replies, copy fast. Optimized visual hierarchy for daily use.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr,1fr]">
        <section className="soft-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold sm:text-xl">Input</h2>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300">MVP</span>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">快捷输入模板</label>
            <div className="flex flex-wrap gap-2">
              {INPUT_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:border-blue-400 hover:text-white"
                  onClick={() => applyTemplate(t.text)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">LinkedIn Text</label>
            <textarea
              className="h-44 w-full rounded-xl border border-slate-600 bg-slate-950/80 p-3 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste post/comment/DM here..."
            />
            <p className="mt-1 text-xs text-slate-400">{text.length}/2000</p>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-300">Your Draft Reply (optional)</label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-600 bg-slate-950/80 p-3 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              value={draftReply}
              onChange={(e) => setDraftReply(e.target.value)}
              placeholder="Type your rough reply, we’ll polish it..."
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 sm:w-auto"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>
            <button
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-semibold text-white transition hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 sm:w-auto"
              disabled={loading || !canSubmit}
              onClick={run}
            >
              {loading ? "Processing..." : "Translate & Suggest"}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        <section className="soft-card p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl">Output</h2>

          {!data ? (
            <div className="glass rounded-xl p-5 text-sm text-slate-300">
              Paste text and click <strong>Translate & Suggest</strong>. Results will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Translation</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("translation", data.translation)}>
                    {copiedKey === "translation" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.translation}</p>
              </div>

              <div className="space-y-2">
                {data.suggestions.map((s, i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Suggestion {i + 1}</span>
                        {i === 0 && <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-200">Best</span>}
                      </div>
                      <button className="text-sm text-blue-300" onClick={() => copy(`s-${i}`, s)}>
                        {copiedKey === `s-${i}` ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                    <p className="leading-7 text-slate-100">{s}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Polished Reply</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("polished", data.polishedReply)}>
                    {copiedKey === "polished" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.polishedReply}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="soft-card mt-5 p-4 sm:p-5">
        <h3 className="mb-3 text-lg font-semibold">History (last 20)</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
          {history.map((h) => {
            const active = activeHistoryId === h.id;
            return (
              <div
                key={h.id}
                className={`rounded-xl border p-3 ${active ? "border-blue-400 bg-blue-950/40" : "border-slate-700 bg-slate-900/70"}`}
              >
                <p className="line-clamp-3 text-sm text-slate-200">{h.text}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</p>
                <div className="mt-2 flex gap-3">
                  <button className="text-xs text-blue-300" onClick={() => useHistory(h)}>
                    Reuse
                  </button>
                  <button className="text-xs text-red-300" onClick={() => removeHistory(h.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
