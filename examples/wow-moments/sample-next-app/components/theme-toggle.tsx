"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    setTheme(next);
  }

  return (
    <button className="ghost" onClick={toggle} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
