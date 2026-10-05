import type { Expense } from "@/lib/types/expense";

export type ChatHistoryTurn = {
  role: "user" | "model";
  text: string;
};

export type SavedExpense = Pick<
  Expense,
  "id" | "description" | "amount" | "category" | "expense_date"
>;

export type ChatTurnResult = {
  reply: string;
  expenses: SavedExpense[];
  savedIds: string[];
  error: string | null;
  /** Present when the turn answered a totals question instead of saving. */
  total: ChatTotal | null;
};

export type ChatTotal = {
  amount: number;
  count: number;
  category: string | null;
  period: string;
};

export const emptyChatTurn: ChatTurnResult = {
  reply: "",
  expenses: [],
  savedIds: [],
  error: null,
  total: null,
};
