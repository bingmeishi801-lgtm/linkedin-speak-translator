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

export default function AppPage() {
  const [text, setText] = useState("");
  const [draftReply, setDraftReply] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Resp | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string>("");

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
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const run = async () => {
    if (!canSubmit) {
      setError("Input must be between 2 and 2000 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone, draftReply }),
      });
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
    } catch {
      setError("Network error, please try again.");
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
  };

  const removeHistory = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    saveHistory(next);
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-3">
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5 lg:col-span-2">
        <h2 className="text-2xl font-semibold">Translator Workspace</h2>
        <p className="text-sm text-slate-300">Paste LinkedIn text, choose tone, then get translation and reply suggestions.</p>

        <div>
          <label className="mb-2 block text-sm text-slate-300">LinkedIn Text</label>
          <textarea
            className="h-44 w-full rounded-xl border border-slate-600 bg-slate-900 p-3 outline-none focus:border-blue-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste post/comment/DM here..."
          />
          <p className="mt-1 text-xs text-slate-400">{text.length}/2000</p>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Your Draft Reply (optional)</label>
          <textarea
            className="h-24 w-full rounded-xl border border-slate-600 bg-slate-900 p-3 outline-none focus:border-blue-400"
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
            placeholder="Type your rough reply, we’ll polish it..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
          </select>
          <button
            className="rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
            disabled={loading || !canSubmit}
            onClick={run}
          >
            {loading ? "Processing..." : "Translate & Suggest"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {data && (
          <div className="space-y-4 rounded-xl border border-slate-600 bg-slate-900/60 p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Translation</h3>
                <button className="text-sm text-blue-300" onClick={() => copy("translation", data.translation)}>
                  {copiedKey === "translation" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-slate-200">{data.translation}</p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Reply Suggestions</h3>
              <div className="space-y-2">
                {data.suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Suggestion {i + 1}</span>
                      <button className="text-sm text-blue-300" onClick={() => copy(`s-${i}`, s)}>
                        {copiedKey === `s-${i}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Polished Reply</h3>
                <button className="text-sm text-blue-300" onClick={() => copy("polished", data.polishedReply)}>
                  {copiedKey === "polished" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-slate-200">{data.polishedReply}</p>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-3 rounded-2xl border border-line bg-card p-5">
        <h3 className="text-lg font-semibold">History (last 20)</h3>
        <div className="max-h-[680px] space-y-2 overflow-auto pr-1">
          {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <p className="line-clamp-2 text-sm text-slate-200">{h.text}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</p>
              <div className="mt-2 flex gap-2">
                <button className="text-xs text-blue-300" onClick={() => useHistory(h)}>
                  Reuse
                </button>
                <button className="text-xs text-red-300" onClick={() => removeHistory(h.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
