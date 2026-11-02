"use client";

import { useState } from "react";

type Period = "monthly" | "yearly";

const PLANS = [
  { name: "Free", price: { monthly: "$0", yearly: "$0" }, perks: ["5 invoices / month", "Email reminders"] },
  { name: "Pro", price: { monthly: "$12", yearly: "$120" }, perks: ["Unlimited invoices", "Your branding", "Auto-reconcile"], featured: true },
  { name: "Team", price: { monthly: "$29", yearly: "$290" }, perks: ["Everything in Pro", "5 seats", "Approval flows"] },
];

export function Pricing() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <>
      <div className="toggle" role="group" aria-label="Billing period">
        {(["monthly", "yearly"] as const).map((p) => (
          <button key={p} aria-pressed={period === p} onClick={() => setPeriod(p)}>
            {p === "monthly" ? "Monthly" : "Yearly (2 months free)"}
          </button>
        ))}
      </div>
      <div className="plans">
        {PLANS.map((plan) => (
          <div key={plan.name} className={plan.featured ? "plan featured" : "plan"}>
            <h3>{plan.name}</h3>
            <div className="price">
              {plan.price[period]}
              <small> / {period === "monthly" ? "mo" : "yr"}</small>
            </div>
            <ul>
              {plan.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <a href="#" className="button">
              Choose {plan.name}
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
