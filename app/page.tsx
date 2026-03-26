import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="soft-card p-8 sm:p-10">
          <p className="section-title">LINKEDIN ENGLISH ASSISTANT</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Understand LinkedIn faster. Reply in better English.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Paste any LinkedIn post, comment, or DM. Get instant Chinese translation, reply suggestions, and a polished English draft in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app" className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 font-semibold text-white transition hover:from-blue-400 hover:to-indigo-400">
              Try it now
            </Link>
            <a href="#example" className="rounded-xl border border-slate-600 bg-slate-900 px-5 py-3 font-semibold text-slate-100 transition hover:border-blue-400">
              See example
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-400">For Chinese professionals who use LinkedIn in English.</p>
        </div>

        <div id="example" className="soft-card p-5 sm:p-6">
          <p className="mb-3 text-sm font-medium text-slate-300">Example</p>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-400">Input</p>
              <p className="text-sm leading-7 text-slate-100">
                Great post. I especially liked your point on balancing speed and quality in product iteration.
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-400">Output</p>
              <p className="text-sm leading-7 text-slate-100">
                中文理解：这篇内容主要在讨论产品迭代中速度与质量的平衡。
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-100">
                回复建议：Thanks for sharing this. I also think user impact should come before speed when trade-offs appear.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="soft-card p-6">
          <h2 className="text-2xl font-semibold">From “I kind of get it” to “I know how to reply.”</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-sm font-semibold text-slate-200">Before</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• 看不懂英文细节</li>
                <li>• 不确定怎么回</li>
                <li>• 想回英文但怕不自然</li>
              </ul>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-sm font-semibold text-slate-200">After</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• 立即获得中文理解</li>
                <li>• 拿到 3 条不同语气回复</li>
                <li>• 一键得到 polished version</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="soft-card p-6">
          <h2 className="text-2xl font-semibold">Everything you need to handle LinkedIn in English</h2>
          <div className="mt-5 grid gap-3">
            <div className="glass rounded-xl p-4">
              <p className="font-semibold text-slate-100">Instant translation</p>
              <p className="mt-1 text-sm text-slate-300">Understand posts, comments, and DMs in Chinese.</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="font-semibold text-slate-100">Smart reply suggestions</p>
              <p className="mt-1 text-sm text-slate-300">Get multiple reply options based on tone and context.</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="font-semibold text-slate-100">Polished English draft</p>
              <p className="mt-1 text-sm text-slate-300">Turn rough ideas into natural, professional replies.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 soft-card p-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-slate-400">Step 1</p>
            <p className="mt-1 font-semibold text-slate-100">Paste LinkedIn content</p>
            <p className="mt-2 text-sm text-slate-300">Paste a post, comment, or DM in English.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-slate-400">Step 2</p>
            <p className="mt-1 font-semibold text-slate-100">Choose your tone</p>
            <p className="mt-2 text-sm text-slate-300">Professional, Friendly, or Casual.</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-slate-400">Step 3</p>
            <p className="mt-1 font-semibold text-slate-100">Get translation and replies</p>
            <p className="mt-2 text-sm text-slate-300">See the Chinese meaning, suggested replies, and a polished draft.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="soft-card p-6">
          <h2 className="text-2xl font-semibold">Built for people using LinkedIn across languages</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Founders</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Job seekers</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Creators</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Professionals building global connections</div>
          </div>
        </div>

        <div className="soft-card p-6">
          <h2 className="text-2xl font-semibold">See what you get</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Chinese translation</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Professional reply</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Friendly reply</div>
            <div className="glass rounded-xl p-4 text-sm text-slate-200">Polished final version</div>
          </div>
        </div>
      </section>

      <section className="mt-8 soft-card p-8 text-center">
        <h2 className="text-3xl font-semibold">Try your first LinkedIn reply in seconds</h2>
        <p className="mt-3 text-slate-300">Paste a post or message and see how much easier LinkedIn English can feel.</p>
        <div className="mt-6">
          <Link href="/app" className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 font-semibold text-white transition hover:from-blue-400 hover:to-indigo-400">
            Try it now
          </Link>
        </div>
      </section>
    </main>
  );
}
