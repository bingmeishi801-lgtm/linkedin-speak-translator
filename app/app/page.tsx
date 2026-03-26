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
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthMsg, setHealthMsg] = useState<string>("");
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

  const checkHealth = async () => {
    setHealthMsg("");
    setChecking(true);
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      if (res.ok && json?.ok) {
        setHealthMsg(`✅ ${json.message} (${json.model})`);
      } else {
        setHealthMsg(`❌ ${json?.message || "Health check failed"}`);
      }
    } catch {
      setHealthMsg("❌ Health check failed due to network error.");
    } finally {
      setChecking(false);
    }
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
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-3">
      <section className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-5 lg:col-span-2">
        <h2 className="text-xl font-semibold sm:text-2xl">Translator Workspace</h2>
        <p className="text-sm text-slate-300">Paste LinkedIn text, choose tone, then get translation and reply suggestions.</p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="w-full rounded-xl border border-slate-500 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-blue-400 sm:w-auto"
            onClick={checkHealth}
            disabled={checking}
          >
            {checking ? "Checking key..." : "Check API Key"}
          </button>
          {healthMsg && <p className="text-xs text-slate-300">{healthMsg}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">LinkedIn Text</label>
          <textarea
            className="h-40 w-full rounded-xl border border-slate-600 bg-slate-900 p-3 outline-none focus:border-blue-400 sm:h-44"
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            className="w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white disabled:opacity-50 sm:w-auto"
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
                  {copiedKey === "translation" ? "Copied ✓" : "Copy"}
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
                        {copiedKey === `s-${i}` ? "Copied ✓" : "Copy"}
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
                  {copiedKey === "polished" ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <p className="text-slate-200">{data.polishedReply}</p>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-3 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <h3 className="text-lg font-semibold">History (last 20)</h3>
        <div className="max-h-[560px] space-y-2 overflow-auto pr-1 sm:max-h-[680px]">
          {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
          {history.map((h) => {
            const active = activeHistoryId === h.id;
            return (
              <div
                key={h.id}
                className={`rounded-lg border p-3 ${active ? "border-blue-400 bg-blue-950/40" : "border-slate-700 bg-slate-900"}`}
              >
                <p className="line-clamp-2 text-sm text-slate-200">{h.text}</p>
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
      </aside>

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
