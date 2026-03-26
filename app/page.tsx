import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="rounded-2xl border border-line bg-card p-8">
        <p className="text-sm text-slate-300">MVP · LinkedIn Speak Translator</p>
        <h1 className="mt-2 text-4xl font-bold">Understand LinkedIn faster, reply better.</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Paste any LinkedIn post, comment, or DM in English. Get Chinese translation, tone-based reply suggestions,
          and polished reply drafts instantly.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/app" className="rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-400">
            Try Free
          </Link>
        </div>
      </section>
    </main>
  );
}
