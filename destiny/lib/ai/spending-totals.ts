import { formatNaira } from "@/lib/format";
import type { SpendingPeriod } from "@/lib/ai/chat";
import type { Expense, ExpenseCategory } from "@/lib/types/expense";

export type TotalsInput = Pick<Expense, "amount" | "category" | "expense_date">[];

const PERIOD_LABELS: Record<SpendingPeriod, string> = {
  this_month: "this month",
  last_month: "last month",
  year_to_date: "this year",
  all_time: "in total",
};

export function periodLabel(period: SpendingPeriod) {
  return PERIOD_LABELS[period];
}

export function sumExpenses(rows: TotalsInput) {
  return rows.reduce((sum, e) => sum + Number(e.amount), 0);
}

export function describeTotals({
  rows,
  period,
  category,
}: {
  rows: TotalsInput;
  period: SpendingPeriod;
  category: ExpenseCategory | null;
}) {
  const label = PERIOD_LABELS[period];
  const total = sumExpenses(rows);
  const money = formatNaira(total);
  const count = rows.length;
  const entries = `${count} ${count === 1 ? "expense" : "expenses"}`;

  if (count === 0) {
    return category
      ? `You have no ${category.toLowerCase()} expenses ${label}.`
      : `You have no expenses recorded ${label}.`;
  }

  return category
    ? `You spent ${money} on ${category.toLowerCase()} ${label}, across ${entries}.`
    : `You spent ${money} ${label}, across ${entries}.`;
}
