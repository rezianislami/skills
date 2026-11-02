"use client";

import { useState } from "react";

export function Signup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("That doesn't look like an email address.");
      return;
    }
    setError(null);
    setJoined(true);
  }

  if (joined) {
    return <p className="done">You&rsquo;re in. Check {email} for your first invoice template.</p>;
  }

  return (
    <>
      <form className="signup" onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email"
          aria-invalid={error ? true : undefined}
          aria-describedby="signup-hint"
        />
        <button className="button">Start free</button>
      </form>
      <p id="signup-hint" className={error ? "hint error" : "hint"}>
        {error ?? "Free for five invoices a month. No card needed."}
      </p>
    </>
  );
}
