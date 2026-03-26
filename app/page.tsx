import Link from "next/link";
export default function Home() {
  return <main className="container grid">
    <section className="card">
      <h1>LinkedIn Speak Translator</h1>
      <p className="meta">Understand faster, reply better.</p>
      <div className="row" style={{marginTop:12}}>
        <Link className="btn btn-primary" href="/app">Try Free</Link>
      </div>
    </section>
  </main>
}
