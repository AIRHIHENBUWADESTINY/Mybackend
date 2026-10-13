import Link from "next/link";
import {
  currentMonth,
  monthKey,
  monthLabel,
  shiftMonth,
  type MonthRange,
} from "@/lib/month";

const navButton =
  "rounded-lg border border-sharpsave-steel-bg px-3 py-2 text-sm font-semibold text-sharpsave-green-dark transition hover:bg-sharpsave-green-dark/5 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

const controlClass =
  "rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light";

function monthHref(ref: { year: number; month: number }) {
  return `/dashboard?month=${monthKey(ref)}`;
}

export function MonthPicker({
  range,
  monthsWithData,
}: {
  range: MonthRange;
  monthsWithData: string[];
}) {
  const previous = shiftMonth(range, -1);
  const next = shiftMonth(range, 1);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sharpsave-steel-bg bg-white p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <Link
          href={monthHref(previous)}
          scroll={false}
          aria-label={`Previous month, ${monthLabel(previous)}`}
          className={navButton}
        >
          &larr;
        </Link>

        <div className="min-w-40 text-center">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {range.label}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {range.isCurrent ? "Current month" : "Past month"}
          </p>
        </div>

        {range.isCurrent ? (
          <span
            aria-hidden="true"
            title="Future months are not available"
            className={`${navButton} cursor-not-allowed opacity-40`}
          >
            &rarr;
          </span>
        ) : (
          <Link
            href={monthHref(next)}
            scroll={false}
            aria-label={`Next month, ${monthLabel(next)}`}
            className={navButton}
          >
            &rarr;
          </Link>
        )}
      </div>

      <form action="/dashboard" className="flex items-center gap-2 sm:ml-auto">
        <label htmlFor="month-jump" className="sr-only">
          Jump to month
        </label>
        <input
          id="month-jump"
          type="month"
          name="month"
          defaultValue={range.key}
          max={monthKey(currentMonth())}
          list="months-with-data"
          className={controlClass}
        />
        <datalist id="months-with-data">
          {monthsWithData.map((key) => (
            <option key={key} value={key} />
          ))}
        </datalist>
        <button
          type="submit"
          className="rounded-lg bg-sharpsave-green-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light"
        >
          Go
        </button>
      </form>
    </div>
  );
}
