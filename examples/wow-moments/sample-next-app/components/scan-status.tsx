"use client";

import { useEffect, useState } from "react";
import { SCAN_STEPS } from "@/lib/projects";

// Simulates a long-running job reporting its current step.
export function ScanStatus({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= SCAN_STEPS.length) {
      onDone();
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <p className="status" role="status">
      {SCAN_STEPS[Math.min(step, SCAN_STEPS.length - 1)]}…
    </p>
  );
}
