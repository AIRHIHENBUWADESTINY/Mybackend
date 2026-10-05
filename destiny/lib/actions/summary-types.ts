import type { MonthlySummary } from "@/lib/ai/summary";

export type SummaryState = {
  data: MonthlySummary | null;
  error: string | null;
};

export const initialSummaryState: SummaryState = { data: null, error: null };
