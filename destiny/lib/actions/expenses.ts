"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  EXPENSE_CATEGORIES,
  type ExpenseFormState,
} from "@/lib/types/expense";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function addExpenseAction(
  prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const description = formData.get("description")?.toString().trim() ?? "";
  const amount = Number(formData.get("amount"));
  const category = formData.get("category")?.toString() ?? "Other";
  const expenseDate = formData.get("expenseDate")?.toString() ?? "";

  if (!description) return { error: "Description is required." };
  if (description.length >= 500)
    return { error: "Description must be less than 500 characters." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter a valid amount greater than 0." };
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category))
    return { error: "Choose a valid category." };
  if (!DATE_REGEX.test(expenseDate))
    return { error: "Enter a valid date." };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    description,
    amount,
    category,
    expense_date: expenseDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { error: null };
}

export async function updateExpenseAction(
  prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const id = formData.get("id")?.toString() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const amount = Number(formData.get("amount"));
  const category = formData.get("category")?.toString() ?? "Other";
  const expenseDate = formData.get("expenseDate")?.toString() ?? "";

  if (!id) return { error: "Missing expense id." };
  if (!description) return { error: "Description is required." };
  if (description.length >= 500)
    return { error: "Description must be less than 500 characters." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter a valid amount greater than 0." };
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category))
    return { error: "Choose a valid category." };
  if (!DATE_REGEX.test(expenseDate))
    return { error: "Enter a valid date." };

  const { error } = await supabase
    .from("expenses")
    .update({
      description,
      amount,
      category,
      expense_date: expenseDate,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { error: null };
}

export async function deleteExpenseAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id")?.toString() ?? "";

  await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/history");
}