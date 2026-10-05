"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { initialAccountState, type AccountState } from "./account-types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DELETE_CONFIRMATION = "DELETE MY ACCOUNT";

function fail(error: string): AccountState {
  return { ...initialAccountState, error };
}

export async function updateAccountAction(
  prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You must be signed in.");

  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString().trim() ?? "";
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!name) return fail("Name is required.");
  if (name.length > 120) return fail("Name must be 120 characters or fewer.");
  if (!DATE_REGEX.test(dateOfBirth)) return fail("Enter a valid date of birth.");
  if (!EMAIL_REGEX.test(email)) return fail("Enter a valid email address.");

  const emailChanged = email !== (user.email ?? "").toLowerCase();
  const passwordChanged = newPassword.length > 0;

  if (!passwordChanged && confirmPassword)
    return fail("Enter a new password to confirm.");

  if (emailChanged || passwordChanged) {
    if (!currentPassword)
      return fail(
        "Confirm your current password to change your email or password."
      );

    if (passwordChanged) {
      if (newPassword.length < 8)
        return fail("New password must be at least 8 characters long.");
      if (newPassword.length > 72)
        return fail("New password must be 72 characters or fewer.");
      if (newPassword !== confirmPassword)
        return fail("New passwords do not match.");
      if (newPassword === currentPassword)
        return fail("Choose a password different from your current one.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: currentPassword,
    });
    if (signInError) return fail("Your current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name, date_of_birth: dateOfBirth },
    ...(emailChanged ? { email } : {}),
    ...(passwordChanged ? { password: newPassword } : {}),
  });

  if (error) return fail(error.message);

  revalidatePath("/account");
  revalidatePath("/dashboard");

  const messages: string[] = [];
  if (emailChanged)
    messages.push("Check your inbox to confirm the new email address.");
  if (passwordChanged) messages.push("Password updated.");
  if (messages.length === 0) messages.push("Profile updated.");

  return { ...initialAccountState, message: messages.join(" ") };
}

export async function deleteAccountAction(
  prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You must be signed in.");

  const password = formData.get("password")?.toString() ?? "";
  const confirmation = formData.get("confirmation")?.toString().trim() ?? "";

  if (!password) return fail("Confirm your password to continue.");
  if (confirmation !== DELETE_CONFIRMATION)
    return fail(`Type ${DELETE_CONFIRMATION} to confirm.`);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password,
  });
  if (signInError) return fail("Your password is incorrect.");

  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: { userId: user.id },
  });

  if (error) {
    return fail(
      "Could not reach the delete-account function. Deploy supabase/functions/delete-account first."
    );
  }

  if (data?.error) return fail(String(data.error));

  await supabase.auth.signOut();
  redirect("/account/deleted");
}
