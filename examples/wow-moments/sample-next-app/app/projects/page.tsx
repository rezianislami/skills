"use client";

import Link from "next/link";
import { useState } from "react";
import { ScanStatus } from "@/components/scan-status";
import type { Project } from "@/lib/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<string | null>(null);

  function create(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!/^[a-z0-9-]{3,}$/.test(trimmed)) {
      setError("Use at least 3 lowercase letters, numbers or dashes.");
      return;
    }
    setError(null);
    setScanning(trimmed);
  }

  function finish() {
    if (!scanning) return;
    setProjects((p) => [{ id: scanning, name: scanning, findings: Math.floor(Math.random() * 5) }, ...p]);
    setScanning(null);
    setName("");
  }

  return (
    <>
      <h1>Projects</h1>

      <form className="form" onSubmit={create}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="project-name"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "name-error" : undefined}
        />
        <button className="button" disabled={scanning !== null}>
          Scan project
        </button>
      </form>
      {error && (
        <p id="name-error" className="error">
          {error}
        </p>
      )}

      {scanning && <ScanStatus onDone={finish} />}

      {projects.length === 0 && !scanning ? (
        <div className="empty">
          <p>No projects yet.</p>
          <p>Scan your first project to see its findings here.</p>
        </div>
      ) : (
        <ul className="list">
          {projects.map((p) => (
            <li key={p.id} className="card">
              <Link href={`/projects/${p.id}`}>
                <span>{p.name}</span>
                <span>{p.findings === 0 ? "Clean" : `${p.findings} findings`}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
