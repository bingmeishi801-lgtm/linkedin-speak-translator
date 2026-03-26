"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    label: "Comment reply",
    text: "Great post. I especially liked your point on balancing speed and quality in product iteration. What metric do you prioritize first when trade-offs happen?",
  },
  {
    key: "dm-reply",
    label: "DM reply",
    text: "Hi [Name], thanks for reaching out. I’m currently exploring AI product opportunities in global markets. Happy to connect and exchange ideas.",
  },
  {
    key: "job-outreach",
    label: "Job outreach",
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
  const copiedTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current);
    };
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

    if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = window.setTimeout(() => setCopiedKey(""), 1500);
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
      <div className="mb-6">
        <p className="section-title">LinkedIn English Assistant</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr,1fr]">
        <section className="soft-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold sm:text-xl">Input</h2>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300">Tool</span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Quick templates</label>
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
            <label className="mb-2 block text-sm font-medium text-slate-200">1. Paste LinkedIn text</label>
            <p className="mb-2 text-sm text-slate-400">Paste a post, comment, or DM in English</p>
            <textarea
              className="h-44 w-full rounded-xl border border-slate-600 bg-slate-950/80 p-3 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste post/comment/DM here..."
            />
            <p className="mt-1 text-xs text-slate-400">{text.length}/2000</p>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-200">2. Add your rough reply (optional)</label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-600 bg-slate-950/80 p-3 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              value={draftReply}
              onChange={(e) => setDraftReply(e.target.value)}
              placeholder="Type your rough reply here. We’ll polish it into natural English."
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="mb-2 block text-sm font-medium text-slate-200">3. Choose tone</label>
              <select
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 sm:w-auto"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <button
              className="mt-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-semibold text-white transition hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 sm:mt-6"
              disabled={loading || !canSubmit}
              onClick={run}
            >
              {loading ? "Generating..." : "Generate reply"}
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
              Paste text and click <strong>Generate reply</strong>. Results will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Chinese meaning</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("translation", data.translation)}>
                    {copiedKey === "translation" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.translation}</p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Professional reply</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("s-0", data.suggestions[0] || "")}>
                    {copiedKey === "s-0" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.suggestions[0]}</p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Friendly reply</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("s-1", data.suggestions[1] || "")}>
                    {copiedKey === "s-1" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.suggestions[1]}</p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Casual reply</h3>
                  <button className="text-sm text-blue-300" onClick={() => copy("s-2", data.suggestions[2] || "")}>
                    {copiedKey === "s-2" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <p className="leading-7 text-slate-100">{data.suggestions[2]}</p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Polished final draft</h3>
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
        <h3 className="mb-3 text-lg font-semibold">Recent drafts</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
          {history.map((h) => {
            const active = activeHistoryId === h.id;
            return (
              <div
                key={h.id}
                className={`rounded-xl border p-3 ${active ? "border-blue-400 bg-blue-950/40" : "border-slate-700 bg-slate-900/70"}`}
              >
                <p className="line-clamp-1 text-sm text-slate-200">{h.text}</p>
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
    </main>
  );
}
