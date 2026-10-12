"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  sendExpenseMessageAction,
  undoChatExpensesAction,
} from "@/lib/actions/chat";
import {
  emptyChatTurn,
  type ChatHistoryTurn,
  type ChatTurnResult,
  type ChatTotal,
  type SavedExpense,
} from "@/lib/actions/chat-types";
import { CATEGORY_STYLES } from "@/lib/types/expense";
import { formatDay, formatNaira } from "@/lib/format";

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  expenses?: SavedExpense[];
  savedIds?: string[];
  error?: string | null;
  total?: ChatTotal | null;
};

const inputClass =
  "flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400";

const EXAMPLES = [
  "Spent 4500 on cold noodles and a Fanta",
  "Paid 25k rent yesterday",
  "Uber to the office 3500 this morning",
  "How much did I spend on food this month?",
];

const QUERY_EXAMPLES = [
  "How much did I spend on food this month?",
  "How much on transport last month?",
  "What did I spend in total?",
];

function UndoButton({
  ids,
  onUndone,
  pending,
}: {
  ids: string[];
  onUndone: (ids: string[]) => void;
  pending: boolean;
}) {
  if (ids.length === 0) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        onUndone(ids);
      }}
      className="mt-2 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {pending ? "Undoing…" : `Undo ${ids.length === 1 ? "entry" : "entries"}`}
    </button>
  );
}

function ExpenseChips({ expenses }: { expenses: SavedExpense[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {expenses.map((expense) => {
        const styles =
          CATEGORY_STYLES[expense.category] ?? CATEGORY_STYLES.Other;
        return (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/60"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${styles.badge}`}
              >
                {expense.category}
              </span>
              <span className="truncate text-zinc-700 dark:text-zinc-300">
                {expense.description}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatNaira(Number(expense.amount))}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500">
                {formatDay(expense.expense_date)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ExpenseChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [undoing, setUndoing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const nextId = () => {
    idRef.current += 1;
    return `m-${idRef.current}`;
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      text: trimmed,
    };

    const history: ChatHistoryTurn[] = messages
      .filter((message) => !message.error)
      .map((message) => ({ role: message.role, text: message.text }));

    setMessages((current) => [...current, userMessage]);
    setInput("");

    startTransition(async () => {
      let result: ChatTurnResult;
      try {
        result = await sendExpenseMessageAction(trimmed, history);
      } catch {
        result = { ...emptyChatTurn, error: "Something went wrong. Try again." };
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "model",
          text: result.reply,
          expenses: result.expenses,
          savedIds: result.savedIds,
          error: result.error,
          total: result.total,
        },
      ]);
    });
  };

  const clear = () => {
    if (pending || undoing) return;
    setMessages([]);
    setInput("");
  };

  const undo = (ids: string[]) => {
    setUndoing(true);
    startTransition(async () => {
      await undoChatExpensesAction(ids);
      setMessages((current) =>
        current.map((message) =>
          message.savedIds?.some((id) => ids.includes(id))
            ? {
                ...message,
                expenses: [],
                savedIds: [],
                text: "Removed those entries.",
              }
            : message
        )
      );
      setUndoing(false);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Add expenses and check totals by chat</h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Describe what you spent and the category is picked for you, or ask
              how much you have spent
            </p>
          </div>
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              disabled={pending || undoing}
              title="Clears this conversation. Saved expenses are not deleted."
              className="shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear chat
            </button>
          ) : null}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => send(example)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {example}
              </button>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Or ask about your spending
            </p>
            <div className="flex flex-wrap gap-2">
              {QUERY_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => send(example)}
                  className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
          {messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                {message.text}
              </div>
            ) : (
              <div key={message.id} className="max-w-[92%]">
                {message.text ? (
                  <p className="rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                    {message.text}
                  </p>
                ) : null}
                {message.total ? (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatNaira(message.total.amount)} across{" "}
                    {message.total.count} {message.total.count === 1 ? "expense" : "expenses"}
                    {message.total.category ? ` in ${message.total.category}` : ""}
                    {message.total.period ? ` · ${message.total.period}` : ""}
                  </p>
                ) : null}
                {message.expenses?.length ? (
                  <ExpenseChips expenses={message.expenses} />
                ) : null}
                {message.savedIds?.length ? (
                  <UndoButton
                    ids={message.savedIds}
                    onUndone={undo}
                    pending={undoing}
                  />
                ) : null}
                {message.error ? (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                    {message.error}
                  </p>
                ) : null}
              </div>
            )
          )}
          {pending ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Reading your message…
            </p>
          ) : null}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={pending}
          placeholder="e.g. Spent 4500 on cold noodles, or how much did I spend on food?"
          aria-label="Describe an expense"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending || input.trim().length === 0}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "…" : "Send"}
        </button>
      </form>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Entries save automatically. Check the category and use Undo if it looks
        wrong.
      </p>
    </div>
  );
}
