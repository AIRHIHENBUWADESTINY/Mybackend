"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { initialAuthState, type AuthState } from "./auth-types";

export async function signUpAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const dateOfBirth = formData.get("dateOfBirth")?.toString() ?? "";

  if (!name) return { ...initialAuthState, error: "Name is required." };
  if (!email) return { ...initialAuthState, error: "Email is required." };
  if (!dateOfBirth)
    return { ...initialAuthState, error: "Date of birth is required." };
  if (password.length < 8)
    return {
      ...initialAuthState,
      error: "Password must be at least 8 characters long.",
    };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        date_of_birth: dateOfBirth,
      },
    },
  });

  if (error) return { ...initialAuthState, error: error.message };
  if (!data.user)
    return { ...initialAuthState, error: "Something went wrong. Try again." };

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?message=Please check your email to confirm your sign-up.");
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email) return { ...initialAuthState, error: "Email is required." };
  if (!password) return { ...initialAuthState, error: "Password is required." };

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ...initialAuthState, error: error.message };

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}