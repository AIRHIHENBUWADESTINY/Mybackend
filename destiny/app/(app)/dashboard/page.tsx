import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_STYLES, EXPENSE_CATEGORIES, type Expense } from "@/lib/types/expense";
import { formatDate, formatNaira } from "@/lib/format";
import { monthRange, parseMonthParam } from "@/lib/month";
import { AddExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { MonthlySummary } from "./monthly-summary";
import { ExpenseChat } from "./expense-chat";
import { MonthPicker } from "./month-picker";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your monthly spending at a glance: totals, daily spending and category breakdowns.",
};

const SCHEMA_SQL = `create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'Other',
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;
-- ... (includes select/insert/update/delete policies for auth.uid() = user_id)`;

const cardClass =
  "rounded-2xl border border-sharpsave-steel-bg bg-sharpsave-card-surface shadow-sm shadow-sharpsave-green-dark/5";

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-sharpsave-green-dark sm:text-2xl">
        {value}
      </p>
      {sub ? <p className="mt-1 truncate text-xs text-zinc-400">{sub}</p> : null}
    </div>
  );
}

function DailyChart({
  dailyTotals,
  maxDaily,
  monthLabel,
}: {
  dailyTotals: { day: number; total: number }[];
  maxDaily: number;
  monthLabel: string;
}) {
  const hasData = dailyTotals.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        No spending recorded in this month.
      </p>
    );
  }

  return (
    <div className="flex h-40 items-end gap-[2px] sm:h-44 sm:gap-[3px]">
      {dailyTotals.map((d) => {
        const height =
          d.total > 0 ? Math.max(4, Math.round((d.total / maxDaily) * 160)) : 1;
        return (
          <div
            key={d.day}
            className="group relative flex-1"
            title={`${monthLabel} ${d.day} · ${formatNaira(d.total)}`}
          >
            <div
              className={`w-full rounded-t ${d.total > 0 ? "bg-sharpsave-green-light" : "bg-sharpsave-green-dark/5"}`}
              style={{ height }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const range = monthRange(parseMonthParam(params.month));

  const [{ data, error }, { data: allDates }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", range.start)
      .lte("expense_date", range.end)
      .order("expense_date", { ascending: false }),
    supabase
      .from("expenses")
      .select("expense_date")
      .order("expense_date", { ascending: false })
      .limit(1000),
  ]);

  const tableMissing = Boolean(error);

  const monthsWithData = [
    ...new Set(
      ((allDates as { expense_date: string }[] | null) ?? []).map((row) =>
        row.expense_date.slice(0, 7)
      )
    ),
  ].sort((a, b) => b.localeCompare(a));

  const expenses = (data as Expense[] | null) ?? [];
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const count = expenses.length;
  const average = count ? total / count : 0;
  const highest = expenses.reduce(
    (max, e) => Math.max(max, Number(e.amount)),
    0
  );

  const dailyTotals = Array.from({ length: range.daysInMonth }, (_, i) => {
    const day = i + 1;
    const key = `${range.start.slice(0, 7)}-${String(day).padStart(2, "0")}`;
    const dayTotal = expenses
      .filter((e) => e.expense_date === key)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { day, total: dayTotal };
  });
  const maxDaily = Math.max(...dailyTotals.map((d) => d.total), 0);

  const categoryTotals = EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter((c) => c.total > 0);
  const maxCategory = Math.max(...categoryTotals.map((c) => c.total), 0);

  const name = user.user_metadata.full_name as string | undefined;
  const dateOfBirth = user.user_metadata.date_of_birth as string | undefined;
  const initials = (name ?? user.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sharpsave-green-dark to-sharpsave-green-light p-5 text-white shadow-lg shadow-sharpsave-green-dark/20 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold ring-1 ring-white/25">
                {initials}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                  Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
                </h1>
                <p className="truncate text-xs text-white/70 sm:text-sm">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
                {range.label}
              </span>
              <span className="text-xs text-white/70">
                {count} {count === 1 ? "entry" : "entries"}
              </span>
            </div>
          </div>
        </header>

        {tableMissing ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-900">
              The expenses table isn&apos;t set up yet
            </h2>
            <p className="mt-1 text-sm text-amber-800">
              Create the table and its row-level security policies in the
              Supabase SQL editor before using expenses:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-4 text-xs text-zinc-800">
              {SCHEMA_SQL}
            </pre>
            <p className="mt-2 text-sm text-amber-800">
              The full script is in{" "}
              <code className="rounded bg-white/60 px-1 py-0.5">
                supabase/schema.sql
              </code>
              .
            </p>
          </div>
        ) : (
          <>
            <MonthPicker range={range} monthsWithData={monthsWithData} />

            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <SummaryCard
                label="Total spent"
                value={formatNaira(total)}
                sub={range.label}
              />
              <SummaryCard
                label="Transactions"
                value={String(count)}
                sub={count ? "Recorded this month" : "No entries yet"}
              />
              <SummaryCard
                label="Average"
                value={formatNaira(average)}
                sub="Per expense"
              />
              <SummaryCard
                label="Largest"
                value={formatNaira(highest)}
                sub="Single expense"
              />
            </section>

            <MonthlySummary
              monthLabel={range.label}
              monthKey={range.key}
              isCurrentMonth={range.isCurrent}
            />

            {range.isCurrent ? <ExpenseChat /> : null}

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
              <div className={`${cardClass} flex flex-col gap-4 p-5 sm:p-6`}>
                <div>
                  <h2 className="font-semibold text-sharpsave-green-dark">
                    Add expense
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Record a new expense in naira
                  </p>
                </div>
                <AddExpenseForm />
              </div>

              <div className="flex flex-col gap-5 lg:col-span-2 lg:gap-6">
                <div className={`${cardClass} p-5 sm:p-6`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-sharpsave-green-dark">
                      Daily spending
                    </h2>
                    <span className="shrink-0 text-xs text-zinc-500 sm:text-sm">
                      {range.label}
                    </span>
                  </div>
                  <DailyChart
                    dailyTotals={dailyTotals}
                    maxDaily={maxDaily}
                    monthLabel={range.label}
                  />
                </div>

                <div className={`${cardClass} p-5 sm:p-6`}>
                  <h2 className="mb-5 font-semibold text-sharpsave-green-dark">
                    By category
                  </h2>
                  {categoryTotals.length === 0 ? (
                    <p className="py-6 text-center text-sm text-zinc-500">
                      Nothing to show for {range.label}.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {categoryTotals.map(({ category, total }) => {
                        const styles =
                          CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other;
                        const width = Math.max(
                          2,
                          Math.round((total / maxCategory) * 100)
                        );
                        return (
                          <div key={category} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium text-zinc-700">
                                {category}
                              </span>
                              <span className="font-semibold tabular-nums text-sharpsave-text-primary">
                                {formatNaira(total)}
                              </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sharpsave-green-dark/5">
                              <div
                                className={`h-full rounded-full ${styles.bar}`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold text-sharpsave-green-dark">
                  All expenses
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {range.label} · {count} {count === 1 ? "entry" : "entries"}
                </p>
              </div>
              <ExpenseList expenses={expenses} />
            </section>
          </>
        )}

        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-sharpsave-steel-bg bg-sharpsave-green-dark/[0.04] px-5 py-4">
            <h2 className="font-semibold text-sharpsave-green-dark">
              Profile information
            </h2>
          </div>
          <dl className="divide-y divide-zinc-100">
            {[
              { label: "Name", value: name ?? "—" },
              { label: "Email", value: user.email ?? "—" },
              { label: "Date of birth", value: formatDate(dateOfBirth) },
              { label: "User ID", value: user.id },
              { label: "Member since", value: formatDate(user.created_at) },
            ].map((field) => (
              <div
                key={field.label}
                className="flex flex-col gap-1 bg-sharpsave-card-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-sm font-medium text-zinc-500">
                  {field.label}
                </dt>
                <dd className="text-sm font-semibold break-all text-sharpsave-text-primary">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
