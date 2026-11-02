import Link from "next/link";

const FINDINGS = [
  { id: "f1", title: "Admin panel reachable without auth", risk: "High" },
  { id: "f2", title: "TLS 1.0 still accepted", risk: "Medium" },
  { id: "f3", title: "Server header leaks version", risk: "Low" },
];

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Link href="/projects">← Projects</Link>
      <h1>{id}</h1>
      <ul className="list">
        {FINDINGS.map((f) => (
          <li key={f.id} className="card">
            <strong>{f.risk}</strong> {f.title}
          </li>
        ))}
      </ul>
    </>
  );
}
