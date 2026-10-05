export type MonthRef = {
  year: number;
  /** 1-12 */
  month: number;
};

export type MonthRange = MonthRef & {
  /** "2026-10" */
  key: string;
  label: string;
  /** "2026-10-01" */
  start: string;
  /** "2026-10-31" */
  end: string;
  daysInMonth: number;
  isCurrent: boolean;
};

/** How far back the user is allowed to browse. */
const MAX_MONTHS_BACK = 60;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function currentMonth(): MonthRef {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthKey({ year, month }: MonthRef) {
  return `${year}-${pad(month)}`;
}

export function compareMonths(a: MonthRef, b: MonthRef) {
  return a.year === b.year ? a.month - b.month : a.year - b.year;
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const zeroBased = new Date(year, month - 1 + delta, 1);
  return { year: zeroBased.getFullYear(), month: zeroBased.getMonth() + 1 };
}

export function monthLabel({ year, month }: MonthRef) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Parses a `?month=YYYY-MM` value. Falls back to the current month when the
 * value is missing or malformed, and clamps future months and months beyond the
 * browse limit back into range so a hand-edited URL cannot ask for nonsense.
 */
export function parseMonthParam(
  value: string | string[] | undefined,
  now: Date = new Date()
): MonthRef {
  const fallback = currentMonth();

  if (typeof value !== "string") return fallback;

  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return fallback;

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) return fallback;
  if (year < 1000 || year > 9999) return fallback;

  const requested: MonthRef = { year, month };
  const current: MonthRef = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };

  if (compareMonths(requested, current) > 0) return current;

  const earliest = shiftMonth(current, -MAX_MONTHS_BACK);
  if (compareMonths(requested, earliest) < 0) return earliest;

  return requested;
}

export function monthRange(ref: MonthRef): MonthRange {
  const end = new Date(ref.year, ref.month, 0);

  return {
    ...ref,
    key: monthKey(ref),
    label: monthLabel(ref),
    start: `${ref.year}-${pad(ref.month)}-01`,
    end: `${ref.year}-${pad(ref.month)}-${pad(end.getDate())}`,
    daysInMonth: end.getDate(),
    isCurrent: monthKey(ref) === monthKey(currentMonth()),
  };
}
