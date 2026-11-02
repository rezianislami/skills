"use client";

import { useState } from "react";

const PLANS = { monthly: "$29 / month", yearly: "$290 / year" } as const;
type Period = keyof typeof PLANS;

export default function SettingsPage() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <>
      <h1>Settings</h1>
      <section className="section">
        <h2>Billing</h2>
        <div className="tabs" role="tablist" aria-label="Billing period">
          {(Object.keys(PLANS) as Period[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              aria-controls="plan-panel"
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <p id="plan-panel" role="tabpanel">
          Pro plan: <strong>{PLANS[period]}</strong>
        </p>
      </section>
    </>
  );
}
