"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractExpenses, type ParsedExpense, type SpendingQuery } from "@/lib/ai/chat";
import { describeTotals, sumExpenses } from "@/lib/ai/spending-totals";
import { monthRange, parseMonthParam, shiftMonth } from "@/lib/month";
import type { Expense } from "@/lib/types/expense";
import {
  emptyChatTurn,
  type ChatHistoryTurn,
  type ChatTurnResult,
  type SavedExpense,
} from "@/lib/actions/chat-types";

const MAX_MESSAGE_LENGTH = 1000;
const HISTORY_TURNS = 12;

/** Today in the user's local timezone, so "yesterday" resolves correctly. */
function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export async function sendExpenseMessageAction(
  message: string,
  history: ChatHistoryTurn[]
): Promise<ChatTurnResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ...emptyChatTurn, error: "You must be signed in." };
  }

  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) {
    return { ...emptyChatTurn, error: "Type an expense to add." };
  }

  const recentHistory = history
    .filter(
      (turn): turn is ChatHistoryTurn =>
        typeof turn?.text === "string" &&
        (turn.role === "user" || turn.role === "model")
    )
    .slice(-HISTORY_TURNS)
    .map((turn) => ({ role: turn.role, text: turn.text.slice(0, 600) }));

  try {
    const today = todayIso();

    const turn = await extractExpenses({
      message: trimmed,
      history: recentHistory,
      today,
    });

    if (turn.intent === "spending_query") {
      return answerSpendingQuery({
        supabase,
        userId: user.id,
        turn,
        today,
      });
    }

    if (turn.expenses.length === 0) {
      return { ...emptyChatTurn, reply: turn.reply };
    }

    const rows = turn.expenses.map((expense: ParsedExpense) => ({
      user_id: user.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expense_date: expense.expense_date,
    }));

    const { data, error } = await supabase
      .from("expenses")
      .insert(rows)
      .select("id, description, amount, category, expense_date");

    if (error) {
      return { ...emptyChatTurn, reply: turn.reply, error: error.message };
    }

    revalidatePath("/dashboard");

    const expenses = (data ?? []) as SavedExpense[];

    return {
      ...emptyChatTurn,
      reply: turn.reply,
      expenses,
      savedIds: expenses.map((expense) => expense.id),
      error: turn.needsReview
        ? "Some details were unclear, so those entries were skipped. Try rephrasing them."
        : null,
    };
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return { ...emptyChatTurn, error: text };
  }
}

async function answerSpendingQuery({
  supabase,
  userId,
  turn,
  today,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  turn: { reply: string; query: SpendingQuery };
  today: string;
}): Promise<ChatTurnResult> {
  const { category, period } = turn.query;

  if (!period) {
    return {
      ...emptyChatTurn,
      reply: "Which period should I total? This month, last month, this year, or all time?",
    };
  }

  // Only fetch what the question can possibly need, so a bad period cannot
  // pull the user's entire history into memory.
  const query = supabase
    .from("expenses")
    .select("amount, category, expense_date")
    .eq("user_id", userId);

  const thisMonth = parseMonthParam(today.slice(0, 7));

  if (period === "this_month") {
    const range = monthRange(thisMonth);
    query.gte("expense_date", range.start).lte("expense_date", range.end);
  } else if (period === "last_month") {
    const range = monthRange(shiftMonth(thisMonth, -1));
    query.gte("expense_date", range.start).lte("expense_date", range.end);
  } else if (period === "year_to_date") {
    query.gte("expense_date", `${today.slice(0, 4)}-01-01`);
  }

  if (category) query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    return { ...emptyChatTurn, error: error.message };
  }

  const rows = (data ?? []) as Pick<
    Expense,
    "amount" | "category" | "expense_date"
  >[];

  const reply = describeTotals({ rows, period, category });
  const amount = sumExpenses(rows);

  return {
    ...emptyChatTurn,
    reply,
    total: {
      amount,
      count: rows.length,
      category,
      period,
    },
  };
}

export async function undoChatExpensesAction(ids: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !Array.isArray(ids) || ids.length === 0) return;

  await supabase
    .from("expenses")
    .delete()
    .in(
      "id",
      ids.filter((id) => typeof id === "string" && id.length > 0)
    )
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
