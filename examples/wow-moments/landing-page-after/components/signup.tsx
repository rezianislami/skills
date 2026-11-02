"use client";

import { useEffect, useRef, useState } from "react";

export function Signup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const doneRef = useRef<HTMLParagraphElement>(null);

  // The input the user was typing in disappears on success, which would drop
  // keyboard focus to <body>. Focusing the confirmation keeps their place and
  // makes screen readers read it. Chosen over role="status": a live region
  // that is inserted together with its text is often not announced.
  useEffect(() => {
    if (joined) doneRef.current?.focus();
  }, [joined]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("That doesn't look like an email address.");
      return;
    }
    setError(null);
    setJoined(true);
  }

  // Both states share one grid cell (see .signup-slot in globals.css). The form
  // stays mounted but invisible after success, so the slot keeps the form's
  // height at every viewport width and the stats below don't jump up. A
  // min-height would need a magic number that breaks when the hint wraps.
  return (
    <div className="signup-slot" data-state={joined ? "done" : "idle"}>
      <div className="signup-entry">
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
      </div>
      {joined && (
        <p ref={doneRef} tabIndex={-1} className="done">
          <svg className="done-check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            {/* pathLength=1 lets the CSS dash values be 0..1 regardless of the path's real length. */}
            <path d="M5 12.5l4.5 4.5L19 7" pathLength={1} />
          </svg>
          You&rsquo;re in. Check {email} for your first invoice template.
        </p>
      )}
    </div>
  );
}
