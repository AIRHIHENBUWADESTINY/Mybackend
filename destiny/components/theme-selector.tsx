"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  readStoredTheme,
  storeTheme,
  type ThemeMode,
} from "@/lib/theme";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeSelector() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(readStoredTheme());
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  function select(next: ThemeMode) {
    setMode(next);
    applyTheme(next);
    storeTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex rounded-lg border border-sharpsave-steel-bg bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {OPTIONS.map((option) => {
        const active = mounted && mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => select(option.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-sharpsave-green-dark text-white"
                : "text-zinc-600 hover:text-sharpsave-green-dark dark:text-zinc-400 dark:hover:text-sharpsave-green-light"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
