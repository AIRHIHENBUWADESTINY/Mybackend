"use client";

import { useState, useTransition } from "react";
import { generateSummaryAction } from "@/lib/actions/summary";
import { type SummaryState } from "@/lib/actions/summary-types";

const confidenceStyles: Record<string, string> = {
  high:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function MonthlySummary({
  monthLabel,
  monthKey,
  isCurrentMonth,
}: {
  monthLabel: string;
  monthKey: string;
  isCurrentMonth: boolean;
}) {
  const [state, setState] = useState<SummaryState>({ data: null, error: null });
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      setState(await generateSummaryAction(monthKey));
    });
  };

  return (
    <div className="rounded-xl border border-sharpsave-steel-bg bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Monthly summary</h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            A short read on your {monthLabel} spending
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="rounded-lg bg-sharpsave-green-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light disabled:opacity-60"
        >
          {pending
            ? "Generating…"
            : state.data
              ? "Regenerate"
              : "Generate summary"}
        </button>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {state.error}
        </p>
      ) : null}

      {state.data ? (
        <div className="mt-5 flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {state.data.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {state.data.improvement_area ? (
              <span className="rounded-full border border-sharpsave-gold/40 bg-sharpsave-gold/15 px-2.5 py-0.5 text-xs font-medium text-sharpsave-green-dark">
                {state.data.improvement_area}
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${confidenceStyles[state.data.confidence]}`}
            >
              {state.data.confidence} confidence
            </span>
          </div>

          {state.data.improvement_reason ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {state.data.improvement_reason}
            </p>
          ) : null}

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Generated from your recorded expenses only. Not financial advice.
          </p>
        </div>
      ) : null}

      {!state.data && !state.error && !pending ? (
        <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
          Generate a summary to see your totals, your largest category
          {isCurrentMonth ? ", and how this month compares with the last one" : ""}
          .
        </p>
      ) : null}
    </div>
  );
}
