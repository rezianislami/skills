import Link from "next/link";

const STATS = [
  { value: "12,480", label: "endpoints scanned" },
  { value: "99.9%", label: "uptime last quarter" },
  { value: "3m 12s", label: "median scan time" },
];

const FEATURES = [
  { title: "Continuous scanning", body: "Every deploy is scanned against the latest rule set." },
  { title: "Readable reports", body: "Findings grouped by risk, with the fix next to each one." },
  { title: "Team workflows", body: "Assign, comment and close findings without leaving the report." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Know what changed before attackers do.</h1>
        <p>Scanboard watches your endpoints and tells you, in plain language, what a deploy exposed.</p>
        <Link href="/projects" className="button">
          Start a scan
        </Link>
      </section>

      <section className="stats" aria-label="Numbers">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>Why teams switch</h2>
        <div className="list">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
