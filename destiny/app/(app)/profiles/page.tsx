import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cardClass } from "@/lib/ui";
import type { ManagedAccount } from "@/lib/types/managed-account";
import { AddUserForm } from "./add-user-form";
import { ManagedUserList } from "./managed-user-list";

export const metadata: Metadata = {
  title: "Profiles",
  description: "Create and remove sign-in accounts for other people.",
};

const SCHEMA_SQL = `create table public.managed_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.managed_accounts enable row level security;
-- ... (includes select/delete policies for auth.uid() = owner_id)`;

export default async function ProfilesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("managed_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  const tableMissing = Boolean(error);
  const accounts: ManagedAccount[] = data ?? [];

  const name = (user.user_metadata.full_name as string | undefined) ?? "";
  const initials = (name || user.email || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sharpsave-green-dark text-sm font-semibold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-sharpsave-green-dark">
              Profiles
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Create and remove sign-in accounts for other people
            </p>
          </div>
        </header>

        {tableMissing ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
            <h2 className="font-semibold text-amber-900 dark:text-amber-200">
              The managed_accounts table isn&apos;t set up yet
            </h2>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              Create the table and its row-level security policies in the
              Supabase SQL editor before managing profiles:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-4 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {SCHEMA_SQL}
            </pre>
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
              The full script is in{" "}
              <code className="rounded bg-white/60 px-1 py-0.5 dark:bg-black/30">
                supabase/schema.sql
              </code>
              .
            </p>
          </div>
        ) : (
          <>
            <section className={cardClass}>
              <h2 className="font-semibold">Add an account</h2>
              <p className="mt-0.5 mb-5 text-sm text-zinc-500 dark:text-zinc-400">
                Creates a real sign-in account for someone else. They get their
                own login and their own expenses.
              </p>
              <AddUserForm />
            </section>

            <section>
              <h2 className="font-semibold">Accounts you manage</h2>
              <p className="mt-0.5 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                Deleting an account removes it permanently, along with its
                expenses.
              </p>
              <ManagedUserList accounts={accounts} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
