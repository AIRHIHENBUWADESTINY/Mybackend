import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Expense } from "@/lib/types/expense";
import { formatNaira } from "@/lib/format";
import { ExpenseList } from "../dashboard/expense-list";

export const metadata: Metadata = {
  title: "History",
  description: "Every expense you have recorded, newest first.",
};

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sharpsave-steel-bg bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1000);

  const tableMissing = Boolean(error);
  const expenses = (data as Expense[] | null) ?? [];
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-sharpsave-green-dark">
            History
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Every expense you&apos;ve recorded, newest first.
          </p>
        </header>

        {tableMissing ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">
              History isn&apos;t available yet
            </h2>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              Set up the expenses table in Supabase to see your transactions
              here.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 sm:max-w-md">
              <SummaryCard
                label="Transactions"
                value={String(expenses.length)}
              />
              <SummaryCard label="Total spent" value={formatNaira(total)} />
            </section>

            <section className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold">All transactions</h2>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {expenses.length}{" "}
                  {expenses.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <ExpenseList
                expenses={expenses}
                emptyMessage="No expenses recorded yet."
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
