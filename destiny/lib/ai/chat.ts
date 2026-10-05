import { CHAT_RESPONSE_SCHEMA, CHAT_SYSTEM_PROMPT } from "@/lib/ai/chat-prompt";
import { extractJson, generateJson, resolveModels } from "@/lib/ai/summary";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/types/expense";

export type ParsedExpense = {
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
};

export type SpendingPeriod =
  | "this_month"
  | "last_month"
  | "year_to_date"
  | "all_time";

export type SpendingQuery = {
  category: ExpenseCategory | null;
  period: SpendingPeriod | null;
};

export type ParsedChatTurn = {
  reply: string;
  expenses: ParsedExpense[];
  intent: "record_expense" | "spending_query";
  query: SpendingQuery;
  /** Fields the model guessed at or could not determine. */
  needsReview: boolean;
};

const MAX_REPLY_LENGTH = 600;
const MAX_EXPENSES_PER_TURN = 12;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeCategory(value: unknown): ExpenseCategory | null {
  if (typeof value !== "string") return null;
  const match = EXPENSE_CATEGORIES.find(
    (category) => category.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? null;
}

function isValidDate(value: string, today: string) {
  if (!DATE_REGEX.test(value)) return false;
  if (Number.isNaN(Date.parse(`${value}T00:00:00`))) return false;
  return value <= today;
}

function clampDescription(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, 120);
  return trimmed || null;
}

export function parseChatTurn(raw: unknown, today: string): ParsedChatTurn {
  if (!raw || typeof raw !== "object") {
    throw new Error("Chat response was not an object.");
  }

  const data = raw as Record<string, unknown>;

  const reply =
    typeof data.reply === "string"
      ? data.reply.replace(/\s+/g, " ").trim().slice(0, MAX_REPLY_LENGTH)
      : "";

  const rawIntent =
    typeof data.intent === "string" ? data.intent.trim().toLowerCase() : "";
  const intent: ParsedChatTurn["intent"] =
    rawIntent === "spending_query" ? "spending_query" : "record_expense";

  const rawPeriod = typeof data.query_period === "string" ? data.query_period : "";
  const period =
    rawPeriod === "this_month" ||
    rawPeriod === "last_month" ||
    rawPeriod === "year_to_date" ||
    rawPeriod === "all_time"
      ? rawPeriod
      : null;

  const query: SpendingQuery = {
    category: normalizeCategory(data.query_category),
    period,
  };

  const list = Array.isArray(data.expenses) ? data.expenses : [];
  const expenses: ParsedExpense[] = [];

  for (const item of list.slice(0, MAX_EXPENSES_PER_TURN)) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;

    const description = clampDescription(entry.description);
    const category = normalizeCategory(entry.category);
    const amount = Number(entry.amount);
    const date =
      typeof entry.expense_date === "string" ? entry.expense_date.trim() : "";

    if (!description || !category) continue;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (!isValidDate(date, today)) continue;

    expenses.push({
      description,
      amount: Math.round(amount * 100) / 100,
      category,
      expense_date: date,
    });
  }

  return {
    reply:
      reply ||
      (intent === "spending_query"
        ? "I can total that up. Which period should I use?"
        : "I could not read that one. Could you rephrase it?"),
    expenses,
    intent,
    query,
    needsReview: list.length > expenses.length,
  };
}

export async function extractExpenses({
  message,
  history,
  today,
}: {
  message: string;
  history: { role: "user" | "model"; text: string }[];
  today: string;
}): Promise<ParsedChatTurn> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const models = (
    process.env.GEMINI_CHAT_MODEL ?? "gemini-3.1-flash-lite"
  )
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  const text = await generateJson({
    apiKey,
    models: models.length > 0 ? models : resolveModels(process.env),
    buildBody: () => ({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
      contents: [
        ...history.map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.text }],
        })),
        {
          role: "user",
          parts: [{ text: `Current date: ${today}\n\n${message}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseJsonSchema: CHAT_RESPONSE_SCHEMA,
      },
    }),
  });

  return parseChatTurn(extractJson(text), today);
}
