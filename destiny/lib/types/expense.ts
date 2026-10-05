export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Rent",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  created_at: string;
};

export type ExpenseFormState = {
  error: string | null;
};

export const initialExpenseState: ExpenseFormState = { error: null };

export const CATEGORY_STYLES: Record<string, { badge: string; bar: string }> = {
  Food: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  Transport: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    bar: "bg-sky-500",
  },
  Utilities: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    bar: "bg-violet-500",
  },
  Rent: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  Shopping: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    bar: "bg-rose-500",
  },
  Health: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    bar: "bg-teal-500",
  },
  Entertainment: {
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    bar: "bg-indigo-500",
  },
  Other: {
    badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    bar: "bg-zinc-400",
  },
};