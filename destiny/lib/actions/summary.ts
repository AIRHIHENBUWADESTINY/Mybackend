"use server";

import { createClient } from "@/lib/supabase/server";
import { buildMonthlyStats, generateMonthlySummary } from "@/lib/ai/summary";
import type { Expense } from "@/lib/types/expense";
import type { SummaryState } from "@/lib/actions/summary-types";
import { monthRange, parseMonthParam, shiftMonth } from "@/lib/month";

export async function generateSummaryAction(
  month?: string
): Promise<SummaryState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "You must be signed in." };

  const range = monthRange(parseMonthParam(month));

  const previousRange = monthRange(shiftMonth(range, -1));

  const [current, previous] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, category")
      .gte("expense_date", range.start)
      .lte("expense_date", range.end),
    supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", previousRange.start)
      .lte("expense_date", previousRange.end),
  ]);

  if (current.error) {
    return { data: null, error: current.error.message };
  }

  const expenses = (current.data ?? []) as Pick<Expense, "amount" | "category">[];

  if (expenses.length === 0) {
    return {
      data: null,
      error: `There are no expenses recorded for ${range.label} to summarise.`,
    };
  }

  const previousExpenses = (previous.data ?? []) as Pick<Expense, "amount">[];

  const stats = buildMonthlyStats({
    month: range.label,
    currency: "NGN",
    expenses,
    previousExpenses,
  });

  try {
    const data = await generateMonthlySummary(stats);
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate a summary.";
    return { data: null, error: message };
  }
}
