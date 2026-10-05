"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import { initialProfileState, type ProfileState } from "./profiles-types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string): ProfileState {
  return { ...initialProfileState, error };
}

export async function addUserAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You must be signed in.");

  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";

  if (!name) return fail("Name is required.");
  if (name.length > 120) return fail("Name must be 120 characters or fewer.");
  if (!EMAIL_REGEX.test(email)) return fail("Enter a valid email address.");
  if (dateOfBirth && !DATE_REGEX.test(dateOfBirth))
    return fail("Enter a valid date of birth.");
  if (password.length < 8)
    return fail("Password must be at least 8 characters long.");
  if (password.length > 72)
    return fail("Password must be 72 characters or fewer.");
  if (email === user.email?.toLowerCase())
    return fail("That is already your own email address.");

  if (!currentPassword) return fail("Confirm your password to continue.");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password: currentPassword,
  });
  if (signInError) return fail("Your password is incorrect.");

  const { data, error } = await supabase.functions.invoke("create-account", {
    body: { fullName: name, email, password, dateOfBirth },
  });

  if (error) {
    return fail(
      "Could not reach the create-account function. Deploy supabase/functions/create-account first."
    );
  }

  if (data?.error) return fail(String(data.error));

  revalidatePath("/profiles");
  return {
    ...initialProfileState,
    message: `Account created for ${name}. Share the password with them securely.`,
  };
}

export async function removeUserAction(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You must be signed in.");

  const userId = formData.get("userId")?.toString() ?? "";
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";

  if (!userId) return fail("Missing account.");
  if (userId === user.id)
    return fail("Use account settings to delete your own account.");
  if (!currentPassword) return fail("Confirm your password to continue.");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password: currentPassword,
  });
  if (signInError) return fail("Your password is incorrect.");

  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: { userId },
  });

  if (error) {
    return fail(
      "Could not reach the delete-account function. Deploy supabase/functions/delete-account first."
    );
  }

  if (data?.error) return fail(String(data.error));

  revalidatePath("/profiles");
  return { ...initialProfileState, message: "Account deleted." };
}
