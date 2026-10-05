import { SUMMARY_SYSTEM_PROMPT } from "@/lib/ai/prompt";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const RETRYABLE_STATUS: ReadonlySet<number> = new Set([
  429, 500, 502, 503, 504,
]);
const MAX_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 800;

type GenerationPart = { text?: string };

type GenerateContentResult = {
  candidates?: {
    content?: { parts?: GenerationPart[] };
    finishReason?: string;
  }[];
};

export function resolveModels(env: NodeJS.ProcessEnv) {
  return (env.GEMINI_MODEL ?? "gemini-flash-latest")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function statusFromMessage(message: string): number {
  const match = message.match(/\((\d{3})\)/);
  return match ? Number(match[1]) : 0;
}

async function readModelText(
  response: Response
): Promise<string> {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Gemini request failed (${response.status}). ${detail.slice(0, 200)}`
    );
  }

  const payload = (await response.json()) as GenerateContentResult;

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

/**
 * Calls Gemini with retry on transient failures and fallback across models.
 * `buildBody` is invoked per attempt so each request gets a fresh body.
 */
export async function generateJson({
  apiKey,
  models,
  buildBody,
}: {
  apiKey: string;
  models: string[];
  buildBody: () => Record<string, unknown>;
}): Promise<string> {
  let lastError = "";

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${API_BASE}/${model}:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify(buildBody()),
        });
        return await readModelText(response);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const retryable = RETRYABLE_STATUS.has(statusFromMessage(message));
        lastError = message;

        if (!retryable || attempt === MAX_ATTEMPTS) break;
        await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }

  throw new Error(lastError || "Could not generate a response.");
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("unparseable");
    return JSON.parse(candidate.slice(start, end + 1));
  }
}

export type Confidence = "high" | "medium" | "low";

export type MonthlySummary = {
  summary: string;
  improvement_area: string | null;
  improvement_reason: string;
  confidence: Confidence;
};

export type CategoryStat = {
  name: string;
  amount: number;
  percentage: number;
};

export type MonthlyStats = {
  month: string;
  currency: string;
  total_spending: number;
  transaction_count: number;
  previous_month_total?: number;
  change_percentage?: number;
  highest_category?: string;
  lowest_category?: string;
  average_transaction?: number;
  largest_transaction?: number;
  formatted_amounts?: {
    total: string;
    previous_month_total?: string;
    average_transaction?: string;
    largest_transaction?: string;
    categories: { name: string; amount: string }[];
  };
  categories: CategoryStat[];
};

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildMonthlyStats({
  month,
  currency,
  expenses,
  previousExpenses,
}: {
  month: string;
  currency: string;
  expenses: { amount: number; category: string }[];
  previousExpenses: { amount: number }[];
}): MonthlyStats {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const previousTotal = previousExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const byCategory = new Map<string, number>();
  for (const expense of expenses) {
    const amount = Number(expense.amount);
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + amount
    );
  }

  const categories: CategoryStat[] = [...byCategory.entries()]
    .map(([name, amount]) => ({
      name,
      amount: round(amount),
      percentage: total > 0 ? round((amount / total) * 100, 1) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const hasPrevious = previousTotal > 0;
  const largest = expenses.reduce(
    (max, e) => Math.max(max, Number(e.amount)),
    0
  );

  return {
    month,
    currency,
    total_spending: round(total),
    transaction_count: expenses.length,
    ...(hasPrevious
      ? {
          previous_month_total: round(previousTotal),
          change_percentage: round(
            ((total - previousTotal) / previousTotal) * 100,
            1
          ),
        }
      : {}),
    ...(categories[0] ? { highest_category: categories[0].name } : {}),
    ...(categories.length > 1
      ? { lowest_category: categories[categories.length - 1].name }
      : {}),
    ...(expenses.length > 0
      ? {
          average_transaction: round(total / expenses.length),
          largest_transaction: round(largest),
        }
      : {}),
    formatted_amounts: {
      total: formatMoney(total),
      ...(hasPrevious
        ? { previous_month_total: formatMoney(previousTotal) }
        : {}),
      ...(expenses.length > 0
        ? {
            average_transaction: formatMoney(total / expenses.length),
            largest_transaction: formatMoney(largest),
          }
        : {}),
      categories: categories.map(({ name, amount }) => ({
        name,
        amount: formatMoney(amount),
      })),
    },
    categories,
  };
}

const CONFIDENCES: Confidence[] = ["high", "medium", "low"];

function parseSummary(raw: unknown): MonthlySummary {
  if (!raw || typeof raw !== "object") {
    throw new Error("Model response was not an object.");
  }

  const data = raw as Record<string, unknown>;

  const rawSummary = data.summary;
  const summary =
    typeof rawSummary === "string"
      ? rawSummary.trim()
      : typeof rawSummary === "object" && rawSummary !== null
        ? // Some responses nest prose under a summary object.
          Object.values(rawSummary as Record<string, unknown>)
            .filter((value): value is string => typeof value === "string")
            .join(" ")
            .trim()
        : "";

  if (!summary) {
    throw new Error("Model response was missing a summary.");
  }

  const area =
    typeof data.improvement_area === "string" &&
    data.improvement_area.trim() !== ""
      ? data.improvement_area.trim()
      : null;

  const reason =
    typeof data.improvement_reason === "string"
      ? data.improvement_reason.trim()
      : "";

  const confidence = CONFIDENCES.includes(data.confidence as Confidence)
    ? (data.confidence as Confidence)
    : "low";

  return { summary, improvement_area: area, improvement_reason: reason, confidence };
}

export async function generateMonthlySummary(
  stats: MonthlyStats
): Promise<MonthlySummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const text = await generateJson({
    apiKey,
    models: resolveModels(process.env),
    buildBody: () => ({
      systemInstruction: { parts: [{ text: SUMMARY_SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Summarize this month of expenses:\n${JSON.stringify(stats, null, 2)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  return parseSummary(extractJson(text));
}
