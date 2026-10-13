"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";
import {
  CATEGORY_STYLES,
  EXPENSE_CATEGORIES,
  initialExpenseState,
  type Expense,
} from "@/lib/types/expense";
import { formatDay, formatNaira } from "@/lib/format";

const inputClass =
  "rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light";

const today = new Date().toISOString().slice(0, 10);

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
] as const;

const DEFAULT_SORT: SortKey = "date-desc";
const PAGE_SIZE = 25;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

type PageItem = number | "ellipsis";

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  return pages.reduce<PageItem[]>((items, value, index) => {
    const previous = pages[index - 1];
    if (index > 0 && previous !== undefined && value - previous > 1) {
      items.push("ellipsis");
    }
    items.push(value);
    return items;
  }, []);
}

function CategoryBadge({ category }: { category: string }) {
  const styles = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
    >
      {category}
    </span>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

function DeleteForm({ id }: { id: string }) {
  return (
    <form
      action={deleteExpenseAction}
      onSubmit={(e) => {
        if (!window.confirm("Delete this expense?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}

function EditExpenseForm({
  expense,
  onCancelled,
}: {
  expense: Expense;
  onCancelled: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateExpenseAction,
    initialExpenseState
  );
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      submittedRef.current = false;
      onCancelled();
    }
  }, [pending, state, onCancelled]);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        submittedRef.current = true;
      }}
      className="flex flex-col gap-3 rounded-xl border border-sharpsave-steel-bg bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="id" value={expense.id} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`description-${expense.id}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <input
            id={`description-${expense.id}`}
            name="description"
            type="text"
            required
            maxLength={499}
            defaultValue={expense.description}
            className={inputClass}
          />
        </div>
        <div className="flex-col gap-1.5 sm:flex">
          <label
            htmlFor={`amount-${expense.id}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Amount (₦)
          </label>
          <input
            id={`amount-${expense.id}`}
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            defaultValue={expense.amount}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`category-${expense.id}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id={`category-${expense.id}`}
            name="category"
            defaultValue={expense.category}
            className={inputClass}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`date-${expense.id}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Date
          </label>
          <input
            id={`date-${expense.id}`}
            name="expenseDate"
            type="date"
            required
            max={today}
            defaultValue={expense.expense_date}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelled}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-sharpsave-green-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

const labelClass = "text-xs font-medium text-zinc-500 dark:text-zinc-400";

function SortIndicator({ active, ascending }: { active: boolean; ascending: boolean }) {
  if (!active) {
    return <span className="text-zinc-300 dark:text-zinc-600">↕</span>;
  }
  return <span>{ascending ? "↑" : "↓"}</span>;
}

function FilterToolbar({
  draft,
  onDraftChange,
  onSearch,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  onClear,
  showClear,
  resultSummary,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSearch: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  onClear: () => void;
  showClear: boolean;
  resultSummary: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-sharpsave-steel-bg bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-search" className={labelClass}>
            Search
          </label>
          <div className="flex gap-2">
            <input
              id="expense-search"
              type="search"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Description or category"
              className={`${inputClass} min-w-0 flex-1`}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-sharpsave-green-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-category" className={labelClass}>
            Category
          </label>
          <select
            id="expense-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={inputClass}
          >
            <option value="all">All categories</option>
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="expense-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className={inputClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            disabled={!showClear}
            className="w-full rounded-lg border border-sharpsave-steel-bg px-4 py-2 text-sm font-semibold text-sharpsave-green-dark transition hover:bg-sharpsave-green-dark/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear filters
          </button>
        </div>
      </form>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {resultSummary}
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  start,
  end,
  total,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  start: number;
  end: number;
  total: number;
}) {
  const navClass =
    "rounded-lg border border-sharpsave-steel-bg px-3 py-1.5 text-xs font-semibold text-sharpsave-green-dark transition hover:bg-sharpsave-green-dark/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";
  const pageClass =
    "min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold tabular-nums transition";

  return (
    <div className="flex flex-col gap-3 border-t border-sharpsave-steel-bg bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing {start}–{end} of {total} {total === 1 ? "entry" : "entries"}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={navClass}
        >
          Prev
        </button>

        {buildPageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-xs text-zinc-400 dark:text-zinc-600"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`${pageClass} ${
                item === page
                  ? "bg-sharpsave-green-dark text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={navClass}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ExpenseRow({
  expense,
  onEdit,
}: {
  expense: Expense;
  onEdit: () => void;
}) {
  return (
    <tr>
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {expense.description}
        </p>
        <div className="mt-1">
          <CategoryBadge category={expense.category} />
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
        {formatDay(expense.expense_date)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {formatNaira(Number(expense.amount))}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </button>
          <DeleteForm id={expense.id} />
        </div>
      </td>
    </tr>
  );
}

export function ExpenseList({
  expenses,
  emptyMessage = "No expenses recorded yet this month.",
}: {
  expenses: Expense[];
  emptyMessage?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const visibleExpenses = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = expenses.filter((expense) => {
      const matchesQuery = needle
        ? expense.description.toLowerCase().includes(needle) ||
          expense.category.toLowerCase().includes(needle)
        : true;
      const matchesCategory =
        category === "all" || expense.category === category;
      return matchesQuery && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "amount-desc" || sort === "amount-asc") {
        const diff = Number(a.amount) - Number(b.amount);
        return sort === "amount-desc" ? -diff : diff;
      }
      const diff = a.expense_date.localeCompare(b.expense_date);
      return sort === "date-asc" ? diff : -diff;
    });
  }, [expenses, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleExpenses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedExpenses = visibleExpenses.slice(
    firstIndex,
    firstIndex + PAGE_SIZE
  );

  const visibleTotal = visibleExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const hasFilters =
    query !== "" || category !== "all" || sort !== DEFAULT_SORT;

  const handlePageChange = (next: number) => {
    setPage(Math.min(Math.max(next, 1), totalPages));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = () => {
    setQuery(draft);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: SortKey) => {
    setSort(value);
    setPage(1);
  };

  const handleClear = () => {
    setDraft("");
    setQuery("");
    setCategory("all");
    setSort(DEFAULT_SORT);
    setPage(1);
  };

  const toggleSort = (column: "date" | "amount") => {
    setSort((current) => {
      if (column === "date") {
        return current === "date-desc" ? "date-asc" : "date-desc";
      }
      return current === "amount-desc" ? "amount-asc" : "amount-desc";
    });
    setPage(1);
  };

  const resultSummary = hasFilters
    ? `${visibleExpenses.length} of ${expenses.length} ${
        expenses.length === 1 ? "entry" : "entries"
      } · ${formatNaira(visibleTotal)}`
    : `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"} · ${formatNaira(visibleTotal)}`;

  const headerButtonClass =
    "inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-sharpsave-green-dark dark:hover:text-sharpsave-green-light";

  return (
    <div
      ref={listRef}
      className="overflow-hidden rounded-xl border border-sharpsave-steel-bg dark:border-zinc-800"
    >
      <FilterToolbar
        draft={draft}
        onDraftChange={setDraft}
        onSearch={handleSearch}
        category={category}
        onCategoryChange={handleCategoryChange}
        sort={sort}
        onSortChange={handleSortChange}
        onClear={handleClear}
        showClear={hasFilters}
        resultSummary={resultSummary}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left">
          <thead>
            <tr className="border-b border-sharpsave-steel-bg bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Description
              </th>
              <th
                aria-sort={
                  sort === "date-asc"
                    ? "ascending"
                    : sort === "date-desc"
                      ? "descending"
                      : "none"
                }
                className="px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("date")}
                  className={headerButtonClass}
                >
                  Date
                  <SortIndicator
                    active={sort === "date-desc" || sort === "date-asc"}
                    ascending={sort === "date-asc"}
                  />
                </button>
              </th>
              <th
                aria-sort={
                  sort === "amount-asc"
                    ? "ascending"
                    : sort === "amount-desc"
                      ? "descending"
                      : "none"
                }
                className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                <button
                  type="button"
                  onClick={() => toggleSort("amount")}
                  className={headerButtonClass}
                >
                  Amount
                  <SortIndicator
                    active={sort === "amount-desc" || sort === "amount-asc"}
                    ascending={sort === "amount-asc"}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {pagedExpenses.map((expense) =>
              editingId === expense.id ? (
                <tr key={expense.id}>
                  <td colSpan={4} className="p-4">
                    <EditExpenseForm
                      expense={expense}
                      onCancelled={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setEditingId(expense.id)}
                />
              )
            )}
            {visibleExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {hasFilters
                    ? "No expenses match your search or filters."
                    : emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {visibleExpenses.length > 0 ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          start={firstIndex + 1}
          end={firstIndex + pagedExpenses.length}
          total={visibleExpenses.length}
        />
      ) : null}
    </div>
  );
}