import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { LogoutForm } from "@/app/dashboard/logout-button";
import { AccountForm } from "./account-form";
import { DeleteAccountForm } from "./delete-account-form";
import { cardClass } from "./ui";

export const metadata: Metadata = {
  title: "Account",
  description: "Edit or delete your account",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (user.user_metadata.full_name as string | undefined) ?? "";
  const dateOfBirth = (user.user_metadata.date_of_birth as string | undefined) ?? "";
  const email = user.email ?? "";

  const initials = (name || email || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Account settings
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {email} · Member since {formatDate(user.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Dashboard
            </Link>
            <Link
              href="/profiles"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Profiles
            </Link>
            <LogoutForm />
          </div>
        </header>

        <section className={cardClass}>
          <h2 className="font-semibold">Your account</h2>
          <p className="mt-0.5 mb-5 text-sm text-zinc-500 dark:text-zinc-400">
            Update your details, email address or password.
          </p>
          <AccountForm name={name} email={email} dateOfBirth={dateOfBirth} />
        </section>

        <section className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-zinc-900">
          <h2 className="font-semibold text-red-700 dark:text-red-400">
            Delete account
          </h2>
          <p className="mt-0.5 mb-5 text-sm text-zinc-500 dark:text-zinc-400">
            Removes your profile and all recorded expenses.
          </p>
          <DeleteAccountForm />
        </section>
      </div>
    </main>
  );
}
